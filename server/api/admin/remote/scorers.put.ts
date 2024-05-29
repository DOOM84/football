import {addChampsScorers} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import type {IChamp, IError} from "~/types/interfaces";

export default defineEventHandler(async (event) => {

    try {

        const champs = await prisma.champ.findMany()as unknown as IChamp[]

      const players =  await addChampsScorers(champs);

        for(let i= 0; i < players.length; i++) {

           const player = await prisma.player.findFirst({
                where: {api_id: players[i].api_id}
            })

            players[i].player_id = player?.id || null

        }

        if(players.length) {
            await prisma.scorer.deleteMany()
        }

        await prisma.scorer.createMany({
            data: players as any
        })

        return players;


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
