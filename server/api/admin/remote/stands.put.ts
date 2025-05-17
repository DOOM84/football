import {addChampsStands} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import type {IChamp, IError} from "~/types/interfaces";

export default defineEventHandler(async (event) => {

    try {

        const champs = await prisma.champ.findMany({
            include: {
                teams: {
                    where: {status: true},
                    select: {api_id: true}
                }
        }
        }) as unknown as IChamp[];

      const teams =  await addChampsStands(champs) as Record<string, any>[];

        for(let i= 0; i < teams.length; i++) {

            await prisma.team.update({
                where: {api_id: +teams[i].api_id!},
                data: {...teams[i]},
            })
        }

        return teams


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
