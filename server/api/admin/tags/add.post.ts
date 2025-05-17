import prisma from '~/helpers/prisma';
import { object, string, ObjectSchema, } from 'yup';
import type {IError} from "~/types/interfaces";

const schema: ObjectSchema<{
    name: string;
    slug: string;
}> = object({
    name: string().trim().required('Введите название'),
    slug: string().trim().required('Введите название'),
})

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        await schema.validate(updated);

        const {id} = await prisma.tag.create({
            data: updated
        });

        return {result: {id}}

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