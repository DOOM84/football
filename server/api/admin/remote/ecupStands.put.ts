import {addEcupStands} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import {IError, ITeamInfo} from "~/types/interfaces";

export default defineEventHandler(async (event) => {

    const {slug, api_id} = await readBody(event);

    try {

        const {id} = await prisma.ecup.findFirst({
            where: {slug},
        }) as Record<string, any>

        const ecup_teams = await prisma.ecupTeam.findMany({
            include: {
                team: {select: {slug: true, id: true}}
            }
        }) as unknown as ITeamInfo[];

        if(slug && api_id){
          const stands =  await addEcupStands(api_id, ecup_teams, id)

            if(stands.length) {
                await prisma.ecupStand.deleteMany({where: {ecup_id: +id}})
            }

            await prisma.ecupStand.createMany({
                data: stands
            })

            return stands;
        //    return {msg: 'success'}
        }else{
            return {msg: 'error'}
        }


    } catch (e) {

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
