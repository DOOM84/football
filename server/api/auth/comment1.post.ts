import type {IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";

export default defineEventHandler(async (event) => {

    try {

        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

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
