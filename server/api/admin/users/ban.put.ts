import {IError} from "~/types/interfaces";
import {serverSupabaseServiceRole} from '#supabase/server';


export default defineEventHandler(async (event) => {
    try {
        const client = serverSupabaseServiceRole(event);
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        const {data, error} = await client.auth.admin.updateUserById(
            updated.id as string, {
                ban_duration: updated.term, // 100 years
            }
        )

        if(error) throw error;

        return {result: true}

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