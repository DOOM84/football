import formidable, {Fields, Files} from "formidable";
import prisma from '~/helpers/prisma';
//import fs from "fs";
import { object, string, mixed, ObjectSchema, } from 'yup';
import type {IError} from "~/types/interfaces";
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";
import {Upload} from "~/classes/upload";

const schema: ObjectSchema<{
    title: string,
    subtitle: string,
    body: string,
    image: formidable.Files<string>,
}> = object({
    title: string().trim().required('Введите название'),
    subtitle: string().trim().required('Введите описание'),
    body: string().trim('Введите текст').required('Введите текст'),
    champ_id: mixed().when('ecup_id', {
        is: (id: number | null | undefined) => !id,
        then: (schema) => schema.required('Выберите чемпионат и/или еврокубок'),
        otherwise: (schema) => schema.notRequired()
    }),
    image: mixed<formidable.Files<string>>().required('Выберите изображение') // Pass in the type of `fileUpload`
        .test("image-present", "Выберите изображение",
            files => {
                return files && Array.isArray(files.media_file) && files.media_file.length > 0 &&
                    files.media_file![0].mimetype!.startsWith("image/")
            }
        ),
})


export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
        const index = client.initIndex('posts');


        const form = formidable({
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
                resolve({fields: JSON.parse(fields.data as unknown as string), files})
            })
        })

        const {fields, files} = response;

        const champ =  fields.champ?.name ? {name: fields.champ.name, slug: fields.champ.slug} : null;
        const ecup =   fields.ecup?.name ? {name: fields.ecup.name, slug: fields.ecup.slug} : null;

        delete fields.champ;
        delete fields.ecup;

        await schema.validate({...fields, image: files});

        const uploadPicsInst = new Upload(files['media_file'],
            '/img/posts/', undefined,
            {
                width: 800,
                height: 446,
                fit: 'cover',
                position: 'right top'
            },
            [{
                dest: '/img/posts/thumbnails/',
                resizeOpts: {
                    width: 150,
                    height: 89,
                    fit: 'cover',
                    position: 'right top',
                }
            },
            ]);

        const {paths} = await uploadPicsInst.uploadFile() as unknown as { paths: string[] };

        fields.img = {
            original: paths[0],
            thumbnail: `/img/posts/thumbnails/${paths[0].substring(paths[0].lastIndexOf('/') + 1)}`,
        }

        const newTags: number[] = [];

        if (Array.isArray(fields.tags) && fields.tags.length) {
            await Promise.all(fields.tags.map(async (tag: any) => {

                const {id} = await prisma.tag.upsert({
                    where: {slug: tag.slug},
                    update: tag,
                    create: tag,
                })
                newTags.push(id)
            }))
        }

        const {id} = await prisma.post.create({
            data: {
                ...fields,
                date: +fields.date,
                tags: {
                    // deleteMany: {},
                    create: newTags.map((t: number) => ({tag: {connect: {id: +t}}}))
                },
                teams: {
                    // deleteMany: {},
                    create: fields.teams.map((tm: number) => ({team: {connect: {id: +tm}}}))
                },
                players: {
                    // deleteMany: {},
                    create: fields.players.map((p: number) => ({player: {connect: {id: +p}}}))
                },
            }
        });

        await index.saveObject({
            objectID: fields.slug,
            img: fields.img,
            title: fields.title,
            slug: fields.slug,
            subtitle: fields.subtitle,
            body: fields.body,
            date: fields.date,
            status: fields.status,
            champ,
            ecup,
        });

        return {result: {id, img: fields.img}}

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