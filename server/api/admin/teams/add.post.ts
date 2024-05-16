import formidable, {Fields, Files} from "formidable";
import prisma from '~/helpers/prisma';
import fs from "fs";
import {object, string, mixed, ObjectSchema, number,} from 'yup';
import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
import sharp from "sharp";
import {IError} from "~/types/interfaces";

const schema: ObjectSchema<{
    name: string,
    sprite: string,
    champ_id: number,
    image: formidable.Files<string>,
}> = object({
    name: string().trim().required('Введите название'),
    sprite: string().trim().required('Введите координаты иконки в спрайте'),
    champ_id: number().required('Выберите чемпионат'),
    image: mixed<formidable.Files<string>>().required('Выберите изображение') // Pass in the type of `fileUpload`
        .test("image-present", "Выберите изображение",
            files => {
                return  files && Array.isArray(files.media_file) && files.media_file.length > 0
            }
        ),
})


export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const form =  formidable({
            keepExtensions: true,
            allowEmptyFiles: false,
            maxFileSize: 500 * 1024 * 1024 * 1024 * 1024,
            maxFieldsSize: 500 * 1024 * 1024 * 1024 * 1024,
            multiples: true,
        });

        const response = await new Promise<Record<string, Fields | any>>((resolve, reject) => {
            form.parse(event.node.req, (err, fields, files: formidable.Files<string>) => {
                if (err) {
                    reject(err)
                }
                resolve({ fields: JSON.parse(fields.data as unknown as string), files })
            })
        })

        const { fields, files } = response;

        await schema.validate({...fields, image: files});

        const updated: any = await new Promise<any>(async (resolve, reject) => {

                if (files.media_file[0].mimetype.startsWith("image/")) {

                    const origFileName: string = files.media_file[0].originalFilename;

                    const ext: string = origFileName.substring(origFileName.lastIndexOf('.') + 1);

                    const fileName: string = Date.now().toString()+'.'+ext;
                    const oldPath = files.media_file[0].filepath;

                    const img = "/img/logos/" + fileName;

                    const newOrigPath = prepareFileInfo(fileName, '/public/img/logos/', fileName);

                    const stream = fs.createReadStream(oldPath);

                    stream.on('open', () => {

                        const origStream = fs.createWriteStream(newOrigPath);

                        const resizeOrig = {
                            width: 151, //width > 370 ? 370 : null,
                            height: null,
                           // fit: 'cover',
                           // position: 'right top',
                        }

                        const transformerOrig = sharp()
                            .resize(resizeOrig);

                        stream
                            .pipe(transformerOrig)
                            .pipe(origStream);

                    })

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    resolve({
                        ...fields,
                        img
                    });
                } else {
                    reject('Файл не является изображением');
                }
        });

       const {id} = await prisma.team.create({
            data: {
                ...updated,
                }
        });

        return {result: {...updated, id}}

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