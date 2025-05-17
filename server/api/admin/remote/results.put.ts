import {addChampResults} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import type {IError, ITeam} from "~/types/interfaces";

export default defineEventHandler(async (event) => {

    try {

        const {id, api_id} = await readBody(event);

        const results =  await addChampResults(id, api_id) as any[];

        const teams = await prisma.team.findMany({
            select: {id: true, api_id: true}
        }) as unknown as ITeam[];

        for (let i = 0; i < results.length; i++) {

            const team1 = teams.filter(team => team.api_id === +results[i].team1!)[0]
            const team2 = teams.filter(team => team.api_id === +results[i].team2!)[0]

            results[i].team1 = +team1.id;
            results[i].team2 = +team2.id;

            results[i].tour = !parseInt(results[i].tour) ? 99 : results[i].tour;

            await prisma.result.upsert({
                where: { api_id: +results[i].api_id },
                update: results[i],
                create: results[i],
            })
        }

        return results


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
