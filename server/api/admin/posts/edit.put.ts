import formidable, {Fields, Files} from "formidable";
import prisma from '~/helpers/prisma';
import fs from "fs";
import { object, string, number, mixed, ObjectSchema, } from 'yup';
import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
import sharp from "sharp";
import setFilePath from "~/helpers/upload/setFilePath";
import {IError, ITag} from "~/types/interfaces";
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";

const schema: ObjectSchema<{title: string,
    subtitle: string,
    body: string,
}> = object({
    title: string().trim().required('Введите название'),
    subtitle: string().trim().required('Введите описание'),
    body: string().trim('Введите текст').required('Введите текст'),
    champ_id: mixed().when('ecup_id', {
        is: (id: number | null | undefined) => !id,
        then: (schema) => schema.required('Выберите чемпионат и/или еврокубок'),
        otherwise: (schema) => schema.notRequired()
    }),
})
export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
        const index = client.initIndex('posts');

        const form =  formidable({
            keepExtensions: true,
            allowEmptyFiles: false,
            maxFileSize: 500 * 1024 * 1024 * 1024 * 1024,
            maxFieldsSize: 500 * 1024 * 1024 * 1024 * 1024,
            multiples: true,
        });

        const response = await new Promise<Record<string, Fields | any>>((resolve, reject) => {
            form.parse(event.node.req, (err, fields, files) => {
                if (err) {
                    reject(err)
                }
                resolve({ fields: JSON.parse(fields.data as unknown as string), files })
            })
        })

        const { fields, files } = response;

        await schema.validate(fields);

        const updated: any = await new Promise<any>(async (resolve, reject) => {

            if(files && Object.keys(files).length > 0){
                if (files.media_file[0].mimetype.startsWith("image/")) {

                    if (fs.existsSync(setFilePath('/public' + fields.img.original))) {
                        fs.unlinkSync(setFilePath('/public' + fields.img.original));
                    }
                    if (fs.existsSync(setFilePath('/public' + fields.img.thumbnail))) {
                        fs.unlinkSync(setFilePath('/public' + fields.img.thumbnail));
                    }

                    const origFileName: string = files.media_file[0].originalFilename;

                    const ext: string = origFileName.substring(origFileName.lastIndexOf('.') + 1);

                    const fileName: string = Date.now().toString()+'.'+ext; // fields.name.split(' ').join('_')+'.'+ext;
                    const oldPath = files.media_file[0].filepath;

                    const img = {
                        original: "/img/posts/" + fileName,
                        thumbnail: "/img/posts/thumbnails/" + fileName}

                    const newOrigPath = prepareFileInfo(fileName, '/public/img/posts/', fileName);
                    const newThumbPath = prepareFileInfo(fileName, '/public/img/posts/thumbnails/', fileName);

                    // fs.copyFileSync(oldPath, newPath);
                   // const {width, height} =  await sharp(oldPath).metadata();

                    const stream = fs.createReadStream(oldPath);

                    stream.on('open', () => {

                        const origStream = fs.createWriteStream(newOrigPath);
                        const thumbStream = fs.createWriteStream(newThumbPath);

                        const resizeOrig = {
                            width: 800, //width > 370 ? 370 : null,
                            height: 446,
                           // fit: 'cover',
                            position: 'right top',
                        }

                        const transformerOrig = sharp()
                            .resize(resizeOrig);

                        stream
                            .pipe(transformerOrig)
                            .pipe(origStream);


                        const resizeThumb = {
                            width: 150, //width > 370 ? 370 : null,
                            height: 89,
                           // fit: 'cover',
                            position: 'right top',
                        }

                        const transformerThumb = sharp()
                            .resize(resizeThumb);

                        stream
                            .pipe(transformerThumb)
                            .pipe(thumbStream);

                    })

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    resolve({
                        ...fields,
                        img
                    });
                } else {
                    reject('Please upload images only.');
                }
            }else{
                resolve({
                    ...fields,
                });
            }
        });

        if(Array.isArray(updated.newTags) && updated.newTags.length){
            await Promise.all(updated.newTags.map(async (tag: ITag) => {
                const {id} = await prisma.tag.create({data: tag})
                updated.tags.push(id)
            }))
        }

        delete updated.newTags

        await prisma.post.update({
            where: {
                id: updated.id,
            },
            data: {
                ...updated,
                players: {
                    deleteMany: {},
                    create: updated.players.map((p: number) => ({ player: { connect: { id: +p }}}))
                },
                teams: {
                    deleteMany: {},
                    create: updated.teams.map((tm: number) => ({ team: { connect: { id: +tm }}}))
                },
                tags: {
                    deleteMany: {},
                    create: updated.tags.map((tg: number) => ({ tag: { connect: { id: +tg }}}))
                },
                }
        });

        const champ = await prisma.champ.findFirst({
            where: {
                id: updated?.champ_id || undefined
            }
        })

        const ecup = await prisma.ecup.findFirst({
            where: {
                id: updated?.ecup_id || undefined
            }
        })

        await index.saveObject({
            objectID: updated.slug,
            img: updated.img,
            title: updated.title,
            slug: updated.slug,
            subtitle: updated.subtitle,
            body: updated.body,
            date: updated.date,
            status: updated.status,
            champ: champ ? {name: champ.name, slug: champ.slug} : null,
            ecup: ecup ? {name: ecup.name, slug: ecup.slug} : null,
        });

        return {result: updated}

    }catch (e) {
        console.log(e);

        const typedError = e as IError;

        if (typedError.path && typedError.errors?.length) {
            throw createError({
                statusCode: 422,
                message: typedError.errors[0]
            })
        } else {
            throw createError({
                statusCode: 404,
                message: (typeof e === 'string') ? e : 'Error occurred'
            })
        }
    }

})