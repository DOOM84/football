import type {IError, IUser} from "~/types/interfaces";
import { object, string, ObjectSchema, ref } from 'yup';

const schema: ObjectSchema<{password: string; passwordConfirmation: string}> = object({
    password: string()
        .trim('Минимальная длина пароля 6 символов')
        .min(6, 'Минимальная длина пароля 6 символов')
        .required('Введите пароль'),
    passwordConfirmation: string().trim('Минимальная длина пароля 6 символов')
        .required('Введите подтверждение пароля')
        .oneOf([ref('password')], 'Пароли не совпадают'),
});
export default defineEventHandler(async (event) => {

        try {

            // @ts-ignore: Unreachable code error
            BigInt.prototype.toJSON = function (): string {
                return this.toString();
            };

            const credentials = await readBody(event);

            await schema.validate(credentials);

            return {result: true}

        } catch (e) {

            const typedError = e as IError;

            if (typedError.path && typedError.errors?.length) {
                throw createError({
                    statusCode: 422,
                    message: typedError.errors[0]
                })
            } else {
                throw createError({
                    statusCode: 404,
                    message: 'Error occurred'
                })
            }
        }
})
