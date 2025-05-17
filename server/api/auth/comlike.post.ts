import prisma from '~/helpers/prisma';
import type {IError} from "~/types/interfaces";
import type {User} from "@supabase/auth-js";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const {user: authUser} = await $fetch<{user: User}>('/api/getUser', {
            params: {['sb-access-token']: getCookie(event, 'sb-access-token')},
        })

        if(!authUser?.id){
            throw createError({
                statusCode: 404,
                message: 'Ошибка! Вы не авторизованы',
            })
        }

        const {comId, like, userId} = await readBody(event);

        const user = await prisma.profile.findFirst({
            where: {user_id: userId},
            select: {id: true}
        })

        const comment = await prisma.comment.findFirst({
            where: {id: +comId}
        })

        if(!comment){
            throw Error
        }

        if (comment!.user_id === user!.id) {
            throw createError({
                statusCode: 403,
                message: 'Вы являетесь автором комментария'
            })
        }

        const existingLike = await prisma.commentLike.findFirst({
            where: {comment_id: +comId, user_id: user!.id},
        })

        if (existingLike) {
            if ((+like > 0 && existingLike.like > 0) || (+like < 0 && existingLike.like < 0)) {
                throw createError({
                    statusCode: 422,
                    message: 'Вы уже оценили этот комментарий'
                })
            } else if ((+like > 0 && existingLike.like < 0) || (+like < 0 && existingLike.like > 0)) {
                await prisma.commentLike.delete({
                    where: {id: existingLike.id},
                })
            } else {
                await prisma.commentLike.update({
                    where: {id: existingLike.id},
                    data: {like: {increment: +like}}
                })
            }
        } else {
            await prisma.commentLike.create({
                data: {
                    like: +like,
                    user_id: user!.id,
                    comment_id: +comId,
                }
            })
        }

        return {
            like
        }

    } catch (e) {
        throw e as IError;
    }
})
