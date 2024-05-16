import type {IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
export default defineEventHandler(async (event) => {

        try {

            // @ts-ignore: Unreachable code error
            BigInt.prototype.toJSON = function (): string {
                return this.toString();
            };

            const {userId, postId, rate} = await readBody(event);

            const {id} = await prisma.profile.findFirst({
                where: {user_id: userId}
            }) as Record<string, any>

            if(!id){
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Error occurred'
                })
            }

            const rateDb = await prisma.rate.findFirst({
                where: {user_id: +id, post_id: +postId}
            })

            if(rateDb){
                throw createError({
                    statusCode: 403,
                    message: 'Вы уже оценили эту новость'
                })
            }

            await prisma.rate.create({
                data:  {user_id: +id, post_id: +postId, rate: +rate}
            })

            const rates = await prisma.rate.findMany({
                where: {post_id: +postId},
                select: {rate: true},
            })

            const res = rates.length ?
                +(rates.map(r => r.rate).reduce((total, amount) => total + amount)/rates!.length).toFixed(1)
                : 0

            return {rate: res}

        } catch (e) {

            const typedError = e as IError;

            if (typedError.path && typedError.errors?.length) {
                throw createError({
                    statusCode: 422,
                    message: typedError.errors[0]
                })
            }
            else{
                throw typedError;
            }
        }
})
