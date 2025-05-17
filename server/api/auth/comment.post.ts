import type {IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
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

        const {info, post} = await readBody(event);

        const user = await prisma.profile.findFirst({
            where: {user_id: info.user_id},
            select: {id: true, avatar: true, login: true}
        })

        info.user_id = +user!.id;
        info.stamp = +Date.now();

        if (info.quote) {
            info.quote = JSON.parse(info.quote)
        }

        const {id} = await prisma.comment.create({
            data: info
        })
        info._count = {userLikes: 0};
        info.id = id;
        info.post = post;
        info.user = {login: user!.login, avatar: user!.avatar}

        return {newComment: info}

    } catch (e) {

        const typedError = e as IError;

        if (typedError.path && typedError.errors?.length) {
            throw createError({
                statusCode: 422,
                message: typedError.errors[0]
            })
        } else {
            throw typedError;
        }
    }
})
