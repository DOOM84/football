import {addChampTourResults} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import type {IError, ITeam, ITourResult} from "~/types/interfaces";
import groupBy from "~/helpers/groupBy";

export default defineEventHandler(async (event) => {

    try {

        const {id, api_id, current_tour, name, slug, prevDel} = await readBody(event);

        const results =  await addChampTourResults(id, api_id, current_tour) as any[];

        if(prevDel === true) {
            await prisma.tour.deleteMany({where: {champ_id: +id}})
        }

        const teams = await prisma.team.findMany({
            select: {id: true, api_id: true}
        }) as unknown as ITeam[];

        for (let i = 0; i < results.length; i++) {

            const team1 = teams.filter(team => team.api_id === +results[i].team1)[0]
            const team2 = teams.filter(team => team.api_id === +results[i].team2)[0]

            if(team1 && team2){
                results[i].team1 = +team1.id;
                results[i].team2 = +team2.id;
            }

            await prisma.result.update({
                where: {
                    api_id: +results[i].api_id
                },
                data: {
                    res1: results[i].res1,
                    res2: results[i].res2,
                }
            })

            await prisma.tour.upsert({
                where: { api_id: +results[i].api_id },
                update: results[i],
                create: results[i],
            })
        }

       const scores =  await prisma.tour.findMany({
            where: {tour: +current_tour, champ_id: +id},
           orderBy: {
               stamp: 'asc',
           },
           include: {
               home: {select: {slug: true, sprite: true, name: true}},
               away: {select: {slug: true, sprite: true, name: true}},
               champ: {select: {name: true, slug: true}}
           }
        }) as unknown as ITourResult[];

        const res =  {
            champ: {
                name,
                slug
            },
            tour: {
                scores: groupBy(scores, 'date'),
                num: +current_tour
            }
        }

        return {results: res}


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
