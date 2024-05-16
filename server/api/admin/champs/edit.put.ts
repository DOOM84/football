import prisma from '~/helpers/prisma';
import { object, string, number, ObjectSchema, } from 'yup';
import {IError} from "~/types/interfaces";

const schema: ObjectSchema<{
    name: string,
    api_id: number,
    current_tour: number,
    all_tours: number,
}> = object({
    name: string().trim().required('Введите название'),
    api_id: number().required('Введите Api id'),
    current_tour: number().required('Введите текущий тур'),
    all_tours: number().required('Введите общее количество туров'),
})

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        await schema.validate(updated);

        await prisma.champ.update({
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