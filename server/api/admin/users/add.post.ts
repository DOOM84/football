import type {IError, IUser} from "~/types/interfaces";
import { object, string, ObjectSchema, ref } from 'yup';
import { serverSupabaseServiceRole } from '#supabase/server';
type AdminUser = Omit<IUser, 'id' | 'admin' | 'avatar' | 'user_id'>;
import formidable, {Fields} from "formidable";
import fs from "fs";
import prepareFileInfo from "~/helpers/upload/prepareFileInfo";
import sharp from "sharp";
import prisma from "~/helpers/prisma";

const schema: ObjectSchema<AdminUser> = object({

    login: string().trim('Логин некорректный')
        .min(3, 'Логин некорректный')
        .max(100, 'Логин некорректный')
        .matches(/^[0-9A-Za-zа-яґєіїёА-ЯҐЄІЇЁ ]*$/, 'Логин некорректный')
        .required('Введите логин'),
    email: string().trim('Email некорректный')
        .email('Email некорректный').required('Введите Email'),
    password: string()
        .trim('Минимальная длина пароля 6 символов')
        .min(6, 'Минимальная длина пароля 6 символов')
        .required('Минимальная длина пароля 6 символов'),
    passwordConfirmation: string().trim('Минимальная длина пароля 6 символов')
        .required('Пароли не совпадают')
        .oneOf([ref('password')], 'Пароли не совпадают'),
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

            const updated: any = await new Promise<any>(async (resolve, reject) => {

                if (files && Object.keys(files).length > 0) {
                    if (files.media_file[0].mimetype.startsWith("image/")) {

                        const origFileName: string = files.media_file[0].originalFilename;

                        const ext: string = origFileName.substring(origFileName.lastIndexOf('.') + 1);

                        const fileName: string = Date.now().toString() + '.' + ext; // fields.name.split(' ').join('_')+'.'+ext;

                        const oldPath = files.media_file[0].filepath;

                        const avatar = "/img/avatars/" + fileName;

                        const newOrigPath = prepareFileInfo(fileName, '/public/img/avatars/', fileName);

                        const stream = fs.createReadStream(oldPath);

                        stream.on('open', () => {

                            const origStream = fs.createWriteStream(newOrigPath);

                            const resizeOrig = {
                                width: 80, //width > 370 ? 370 : null,
                                height: 80,
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
                            avatar
                        });
                    } else {
                        reject('Файл должен быть изображением.');
                    }
                } else {
                    resolve({
                        ...fields,
                    });
                }
            });

            const user_metadata=  { login: updated.login, admin: updated.admin, avatar: updated.avatar || null};

            if(!user_metadata.admin){user_metadata.admin = null}

            const { data, error } = await client.auth.admin.createUser({
                email: updated.email,
                password: updated.password,
                user_metadata,
                email_confirm: true,
            })

            if (error) throw error;

            await prisma.profile.create({
                data: {
                    user_id: data.user.id,
                    login: updated.login,
                    email: updated.email,
                    avatar: updated.avatar || null,
                }
            })

            return {
                result: {
                    id: data.user.id,
                    login: updated.login,
                    email: updated.email,
                    admin: updated.admin,
                    avatar: updated.avatar || null,
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
                if(typedError.toString().includes('AuthApiError')){
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
