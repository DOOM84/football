import type {IError} from "~/types/interfaces";
import { serverSupabaseServiceRole } from '#supabase/server';
import formidable, {type Fields} from "formidable";
import prisma from "~/helpers/prisma";
import {Upload} from "~/classes/upload";
import type {User} from "@supabase/auth-js";
import { object, mixed, ObjectSchema, } from 'yup';
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/gif", "image/png"];

const schema: ObjectSchema<{
    image: formidable.Files<string>,
}> = object({
    image: mixed<formidable.Files<string>>().required('Неверный тип или размер файла превышен') // Pass in the type of `fileUpload`
        .test("image-present", "Неверный тип или размер файла превышен",
            files => {
                return  files && Array.isArray(files.media_file) && files.media_file.length > 0 &&
                    files.media_file![0].mimetype!.startsWith("image/")
                    && SUPPORTED_FORMATS.includes(files.media_file![0].mimetype!)
            } // Check if `files` is defined
            // Check if `files` is not an empty list
            //  Array.from(files).every(file => file.size <= 2_000_000)
        ),
})

export default defineEventHandler(async (event) => {

    try {

        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const {user} = await $fetch<{user: User}>('/api/getUser', {
            params: {['sb-access-token']: getCookie(event, 'sb-access-token')},
        })

        if(!user?.id){
            throw createError({
                statusCode: 404,
                message: 'error_try_later',
            })
        }

        const client = serverSupabaseServiceRole(event);

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

        await schema.validate({image: files});


        const uploadInst = new Upload(files['media_file'], '/img/avatars/', fields.toDel,
            {height: 80, width: 80});

        const updated = await uploadInst.uploadFile() as unknown as {paths: string[]};

        const user_metadata=  { avatar: updated.paths[0] || null};

        const {data, error} = await client.auth.admin.updateUserById(
            fields.id as string,
            {
                user_metadata
            }
        )

        if (error) throw error;

        await prisma.profile.update({
            where: {
                user_id: fields.id,
            },
            data: { avatar: updated.paths[0] || null}
        });

        return {
            result: {
                message: 'Ваш аватар успешно изменен'
            }
        };

    } catch (e) {

        console.log(e);

        const typedError = e as IError;

        if (typedError.path && typedError.errors?.length) {
            throw createError({
                statusCode: 422,
                message: typedError.errors[0]
            })
        } else {
            throw e as IError;
        }
    }
})
