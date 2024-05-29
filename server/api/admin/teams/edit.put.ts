import formidable, {Fields, Files} from "formidable";
import prisma from '~/helpers/prisma';
//import fs from "fs";
import {object, string, number, ObjectSchema, lazy, mixed,} from 'yup';
//import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
//import sharp from "sharp";
//import setFilePath from "~/helpers/upload/setFilePath";
import type {IError} from "~/types/interfaces";
import {Upload} from "~/classes/upload";

const schema: ObjectSchema<{
    name: string,
    sprite: string,
    champ_id: number
}> = object({
    name: string().trim().required('Введите название'),
    sprite: string().trim().required('Введите координаты иконки в спрайте'),
    champ_id: number().required('Выберите чемпионат'),
    image: lazy((value) => {
        if (value?.media_file) {
            return mixed<formidable.Files<string> | any>().test("image-present", "Выберите изображение с правильным типом",
                files => {
                    return  files && Array.isArray(files.media_file) && files.media_file.length > 0 &&
                        files.media_file![0].mimetype!.startsWith("image/")
                })
        }
        return mixed().nullable().optional();
    }),
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
            form.parse(event.node.req, (err, fields, files) => {
                if (err) {
                    reject(err)
                }
                resolve({ fields: JSON.parse(fields.data as unknown as string), files })
            })
        })

        const { fields, files } = response;

        delete fields.champ;
        delete fields.players;
        delete fields.createdAt;
        delete fields.updatedAt;

        await schema.validate({...fields, image: files});

        if(Array.isArray(files.media_file)) {
            const uploadPicsInst = new Upload(files['media_file'],
                '/img/logos/', fields.img,
                {
                    width: 151,
                });

            const {paths} = await uploadPicsInst.uploadFile() as unknown as { paths: string[] };

            fields.img = paths[0];
        }

        const {id} =  await prisma.team.update({
            where: {
                id: fields.id,
            },
            data: {
                ...fields,
                api_id: +fields.api_id
                }
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