import prisma from '~/helpers/prisma';
import { object, string, number, ObjectSchema, } from 'yup';
import {IError} from "~/types/interfaces";

const schema: ObjectSchema<{
    name: string,
    api_id: number,
    stage: string,
}> = object({
    name: string().trim().required('Введите название'),
    api_id: number().required('Введите Api id'),
    stage: string().trim().required('Выберите стадию турнира'),
})

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        await schema.validate(updated);

       const {id} = await prisma.ecup.create({
           data: updated
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