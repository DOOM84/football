import type {Fields, Files} from "formidable";
import {IncomingForm} from 'formidable';
import {Upload} from "~/classes/upload";

export default defineEventHandler(async (event) => {

    try {

        const customOptions = {
            keepExtensions: true,
            allowEmptyFiles: false,
            maxFileSize: 500 * 1024 * 1024 * 1024 * 1024,
            maxFieldsSize: 500 * 1024 * 1024 * 1024 * 1024,
            multiples: true,
        };
        const form = new IncomingForm(customOptions);

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

        const response = await new Promise<Record<string, Fields | any>>((resolve, reject) => {
            form.parse(event.node.req, (err, _: Fields, files: Files) => {
                if (err) {
                    reject(err)
                }

                if (!files.upload) {
                    reject('File not added')
                }

                if (Array.isArray(files.upload) && !allowedTypes.includes(files.upload[0].mimetype as string)) {
                    reject('File type error')
                }

                resolve({files})
            })
        })

        const {files} = response;

        const uploadInst = new Upload(files['upload'], '/img/posts/uploads/');

        const {paths} = await uploadInst.uploadFile() as unknown as { paths: string[] };

        return {
            fileName: paths[0].substring(paths[0].lastIndexOf('/') + 1),
            uploaded: 1,
            url: paths[0]
        }

    } catch (e) {
        console.log(e);
        throw createError({
            statusCode: 422,
            message: 'Error occurred'
        })
    }
})


