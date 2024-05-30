import {liveScores, matchSquads} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import type {IEcupResult, IError, IMatchInfo, IResult} from "~/types/interfaces";

export default defineEventHandler(async (event) => {

    try {

        const {leagues} = await readBody(event);

        const results = await liveScores(leagues as string) as any[];

        for (let i = 0; i < results.length; i++) {

           const tourRes = await prisma.tour.findFirst({
                where: {
                    api_id: +results[i].api_id
                }
            }) as unknown as IResult;

            if(tourRes?.id){
                await prisma.tour.update({
                    where: {
                       id: tourRes.id
                    },
                    data: {
                        res1: +results[i].res1,
                        res2: +results[i].res2,
                        stamp: +results[i].stamp,
                        date: +results[i].date,
                    }
                })
            }

            const champRes = await prisma.result.findFirst({
                where: {
                    api_id: +results[i].api_id
                }
            }) as unknown as IResult;

            if(champRes?.id){
                await prisma.result.update({
                    where: {
                        id: champRes.id
                    },
                    data: {
                        res1: +results[i].res1,
                        res2: +results[i].res2,
                        stamp: +results[i].stamp,
                        date: +results[i].date,
                    }
                })
            }

            const ecupRes = await prisma.ecupResult.findFirst({
                where: {
                    api_id: +results[i].api_id
                }
            }) as unknown as IEcupResult;

            if(ecupRes?.id){
                await prisma.ecupResult.update({
                    where: {
                        id: ecupRes?.id
                    },
                    data: {
                        res1: +results[i].res1,
                        res2: +results[i].res2,
                        stamp: +results[i].stamp,
                        date: +results[i].date,
                    }
                })
            }

                const match = await prisma.matchInfo.findFirst({
                    where: {
                        OR: [{ch_res: results[i].api_id}, {ecup_res: results[i].api_id}],
                    },
                }) as unknown as IMatchInfo;

                if (match && (!match.lineups || (Array.isArray(match.lineups) && !match.lineups.length))) {

                       const squads = await matchSquads(results[i].api_id);

                    await prisma.matchInfo.update({
                        where: {
                            ...(match.ch_res ? { ch_res: results[i].api_id } : {}) as any,
                            ...(match.ecup_res ? { ecup_res: results[i].api_id } : {}) as any,
                        },
                        data: {
                            info: results[i].events.length ? results[i].events : undefined,
                            lineups: squads
                        }
                    })

                }else if(match){
                    await prisma.matchInfo.update({
                        where: {
                            ...(match.ch_res ? { ch_res: results[i].api_id } : {}) as any,
                            ...(match.ecup_res ? { ecup_res: results[i].api_id } : {}) as any,
                        },
                        data: {
                            info: results[i].events.length ? results[i].events : undefined,
                        }
                    })
                }
        }

        return {results}


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
