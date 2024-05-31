import prisma from '~/helpers/prisma';
import { object, string, number, ObjectSchema, } from 'yup';
import type {IError} from "~/types/interfaces";

const schema: ObjectSchema<{
    name: string,
    api_id: number,
    champ_id: string,
}> = object({
    name: string().trim().required('Введите название'),
    api_id: number().required('Введите Api id'),
    champ_id: string().trim().required('Выберите чемпионат'),
})

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        await schema.validate(updated);

        delete updated.champ;

        await prisma.cup.update({
           where: {
               id: +updated.id,
           },
           data: updated //JSON.parse(JSON.stringify(updated))
        });

        return {result: updated}

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