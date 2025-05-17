import prisma from '~/helpers/prisma';
import type {User} from "@supabase/auth-js";
export default defineEventHandler(async (event) => {

        try {

            // @ts-ignore: Unreachable code error
            BigInt.prototype.toJSON = function (): string {
                return this.toString();
            };

            const {user} = await $fetch<{user: User}>('/api/getUser', {
                params: {['sb-access-token']: getCookie(event, 'sb-access-token')},
            })

            if(!user?.id || !user.app_metadata.admin){
                throw createError({
                    statusCode: 404,
                    message: 'OOPS! Не найдено.',
                })
            }

            const {id} = await readBody(event);

                await prisma.comment.delete({
                    where: {
                        id
                    },
                })

            return {
                toDel: id
            }

        } catch (e) {
            throw createError({
                    statusCode: 404,
                    statusMessage: 'Что-то пошло не так... Попробуйте позже'
                })
        }
})
