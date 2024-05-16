import type {IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";

export default defineEventHandler(async (event) => {

        try {
            // @ts-ignore: Unreachable code error
            BigInt.prototype.toJSON = function (): string {
                return this.toString();
            };

            const info = await readBody(event);

            await prisma.profile.create({
                data: info
            })


            return {res: true};

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
