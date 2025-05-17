import type {IError, IUser} from "~/types/interfaces";
import {object, string, ObjectSchema, ref, mixed} from 'yup';
import {serverSupabaseServiceRole} from '#supabase/server';
type AdminUser = Pick<IUser, 'login' | 'email'>;
import formidable, {Fields} from "formidable";
import prisma from "~/helpers/prisma";
import {Upload} from "~/classes/upload";


const schema: ObjectSchema<AdminUser> = object({
    login: string().trim('Логин некорректный')
        .min(3, 'Логин некорректный')
        .max(100, 'Логин некорректный')
        .matches(/^[0-9A-Za-zа-яґєіїёА-ЯҐЄІЇЁ ]*$/, 'Логин некорректный')
        .required('Введите логин'),
    email: string().trim('Email некорректный')
        .email('Email некорректный').required('Введите Email'),
    password: string().notRequired().min(6, 'Минимальная длина пароля 6 символов').nullable().transform((value) => !!value ? value : null),
    passwordConfirmation: mixed().when('password', {
        is: (password: string | null | undefined) => !password,
        then: (schema) =>
            ref('passwordConfirmation') ? schema.oneOf([ref('password')], 'Пароли не совпадают') : schema.notRequired(),
        otherwise: (schema) => schema.required("Пароли не совпадают")
            .oneOf([ref('password')], 'Пароли не совпадают')
    })
});
export default defineEventHandler(async (event) => {

    try {
        const client = serverSupabaseServiceRole(event);

// @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

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

        await schema.validate(fields);

        const user_metadata: {avatar: string | null; login: string} = {avatar: fields.avatar, login: fields.login}

        const app_metadata = {admin: fields.admin || null}

        if (files && Object.keys(files).length > 0) {

            const uploadInst = new Upload(files['media_file'], '/img/avatars/', fields.avatar || undefined,   {height: 80, width: 80});

            const updated = await uploadInst.uploadFile() as unknown as {paths: string[]};

            user_metadata.avatar = updated.paths[0] || null;
        }

        const {data, error} = await client.auth.admin.updateUserById(
            fields.id as string,
            fields.password ? {
                email: fields.email,
                password: fields.password,
                user_metadata,
                app_metadata
            } : {
                email: fields.email,
                user_metadata,
                app_metadata
            }
        )

        if (error) throw error;

        await prisma.profile.upsert({
            where: {
                user_id: fields.id
            },
            update: {
                login: fields.login,
                email: fields.email,
                avatar: user_metadata.avatar || null,
            },
            create: {
                user_id: fields.id,
                login: fields.login,
                email: fields.email,
                avatar: user_metadata.avatar || null,
            }
        });

        if (error) throw error;

        return {
            result: {
                id: fields.id,
                login: fields.login,
                email: fields.email,
                admin: fields.admin,
                avatar: user_metadata.avatar || null,
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
            if (typedError.toString().includes('AuthApiError')) {
                throw createError({
                    statusCode: 422,
                    message: 'Адрес электронной почты уже зарегистрирован другим пользователем'
                })
            }

            throw createError({
                statusCode: 404,
                message: 'Error occurred'
            })
        }
    }
})
