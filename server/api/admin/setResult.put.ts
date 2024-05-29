import prisma from '~/helpers/prisma';
import type {IEcupTeam, IError, ITeam} from "~/types/interfaces";
import {matchInfo, matchSquads} from "~/helpers/remoteApi";
import getGoals from "~/utils/getGoals";


export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        const resChamp =  await prisma.result.findFirst({
            where: {
                api_id: +updated.api_id
            }
        })

        const tourChamp =  await prisma.tour.findFirst({
            where: {
                api_id: +updated.api_id
            }
        })

        const ecupChamp =  await prisma.ecupResult.findFirst({
            where: {
                api_id: +updated.api_id
            }
        })


        if(!isFinishedOrLive((tourChamp?.stamp || resChamp?.stamp || ecupChamp?.stamp) as unknown as number)){

            if(updated.is_info){
                await prisma.matchInfo.upsert({
                    where: {
                        ...(resChamp ? { ch_res: resChamp.api_id } : {}) as any,
                        ...(ecupChamp ? { ecup_res: ecupChamp.api_id } : {}) as any,
                    },
                    update: {
                        ch_res: resChamp ? resChamp.api_id : null,
                        ecup_res: ecupChamp ? ecupChamp.api_id : null,
                        info: [],
                        lineups: []
                    },
                    create: {
                        ch_res: resChamp ? resChamp.api_id : null,
                        ecup_res: ecupChamp ? ecupChamp.api_id : null,
                        info: [],
                        lineups: []
                    },
                })
            }else{
                await prisma.matchInfo.delete({
                    where: {
                        ...(resChamp ? { ch_res: resChamp.api_id } : {}) as any,
                        ...(ecupChamp ? { ecup_res: ecupChamp.api_id } : {}) as any,
                    }
                })
            }

            if(resChamp){
                await prisma.result.update({
                    where: {
                        api_id: resChamp.api_id as any,
                    },
                    data: {is_info: updated.is_info,
                        stamp: tourChamp?.stamp || undefined,
                        date: tourChamp?.date || undefined,
                    } //JSON.parse(JSON.stringify(updated))
                });

                /*const tourChamp =  await prisma.tour.findFirst({
                    where: {
                        api_id: resChamp.api_id
                    }
                })*/

                if(tourChamp){
                    await prisma.tour.update({
                        where: {
                            api_id: resChamp.api_id as any
                        },
                        data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
                    });
                }
            }

            if(ecupChamp){
                await prisma.ecupResult.update({
                    where: {
                        api_id: ecupChamp.api_id as any,
                    },
                    data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
                });
            }
            return {result: true}
        }

        let events = [];
        let goals: Record<any, any[]> | null = null;

        if(updated.is_info){

            events = await matchInfo(updated.api_id);
            goals = getGoals(events);


            const squads = await matchSquads(updated.api_id);

            if(getPeriod((resChamp?.stamp || ecupChamp?.stamp) as unknown as number)){
                events.map(event =>{
                    if(event.type.toLowerCase() === 'subst'){
                        const assist = {...event.assist}
                        event.assist = {...event.player};
                        event.player = assist;
                    }
                    return event;
                })
            }

            await prisma.matchInfo.create({
                data: {
                    ch_res: resChamp ? resChamp.api_id : null,
                    ecup_res: ecupChamp ? ecupChamp.api_id : null,
                    info: events,
                    lineups: squads,
                }
            })
        }else{
            await prisma.matchInfo.delete({
                where: {
                    ...(resChamp ? { ch_res: resChamp.api_id } : {}) as any,
                    ...(ecupChamp ? { ecup_res: ecupChamp.api_id } : {}) as any,
                }
            })
        }

        if(resChamp){
            if(updated.is_info){
                const homeTeam = await prisma.team.findFirst({
                    where: {
                        id: resChamp.team1 as unknown as number,
                    },
                    select: {api_id: true}
                })  as unknown as ITeam

                const awayTeam = await prisma.team.findFirst({
                    where: {
                        id: resChamp.team2 as unknown as number,
                    },
                    select: {api_id: true}
                }) as unknown as ITeam;

                await prisma.result.update({
                    where: {
                        api_id: resChamp.api_id as unknown as number,
                    },
                    data: {
                        stamp: tourChamp?.stamp || undefined,
                        date: tourChamp?.date || undefined,
                        is_info: updated.is_info,
                        res1: goals && updated.is_info ? (homeTeam?.api_id && Array.isArray(goals![homeTeam.api_id]) ? goals![homeTeam.api_id].length : 0) : 0,
                        res2: goals && updated.is_info ? (awayTeam?.api_id && Array.isArray(goals![awayTeam.api_id]) ? goals![awayTeam.api_id].length : 0) : 0,
                    } //JSON.parse(JSON.stringify(updated))
                });
            }else {
                await prisma.result.update({
                    where: {
                        api_id: resChamp.api_id as any,
                    },
                    data: {is_info: updated.is_info,
                        stamp: tourChamp?.stamp || undefined,
                        date: tourChamp?.date || undefined,
                    } //JSON.parse(JSON.stringify(updated))
                });
            }

            /*const tourChamp =  await prisma.tour.findFirst({
                where: {
                    api_id: resChamp.api_id
                }
            })*/

            if(tourChamp){
                if(updated.is_info){
                    const homeTeam = await prisma.team.findFirst({
                        where: {
                            id: tourChamp.team1 || resChamp.team1  as unknown as number,
                        },
                        select: {api_id: true}
                    })  as unknown as ITeam

                    const awayTeam = await prisma.team.findFirst({
                        where: {
                            id: tourChamp.team2 || resChamp.team2  as unknown as number,
                        },
                        select: {api_id: true}
                    }) as unknown as ITeam;

                    await prisma.tour.update({
                        where: {
                            api_id: tourChamp.api_id as unknown as number,
                        },
                        data: {
                            is_info: updated.is_info,
                            res1: goals && updated.is_info ? (homeTeam?.api_id && Array.isArray(goals![homeTeam.api_id]) ? goals![homeTeam.api_id].length : 0) : 0,
                            res2:goals && updated.is_info ? (awayTeam?.api_id && Array.isArray(goals![awayTeam.api_id]) ? goals![awayTeam.api_id].length : 0) : 0,
                        } //JSON.parse(JSON.stringify(updated))
                    });
                }else{
                    await prisma.tour.update({
                        where: {
                            api_id: resChamp.api_id as unknown as number,
                        },
                        data: {
                            is_info: updated.is_info,
                        } //JSON.parse(JSON.stringify(updated))
                    });
                }
            }
        }


        if(ecupChamp){
            if(updated.is_info){
                const homeTeam = await prisma.ecupTeam.findFirst({
                    where: {
                        id: ecupChamp.team1 as unknown as number,
                    },
                    select: {api_id: true}
                })  as unknown as IEcupTeam

                const awayTeam = await prisma.ecupTeam.findFirst({
                    where: {
                        id: ecupChamp.team2 as unknown as number,
                    },
                    select: {api_id: true}
                }) as unknown as IEcupTeam;

                await prisma.ecupResult.update({
                    where: {
                        api_id: ecupChamp.api_id as unknown as number,
                    },
                    data: {
                        is_info: updated.is_info,
                        res1: goals && updated.is_info ? (homeTeam?.api_id && Array.isArray(goals![homeTeam.api_id]) ? goals![homeTeam.api_id].length : 0) : 0,
                        res2: goals && updated.is_info ? (awayTeam?.api_id && Array.isArray(goals![awayTeam.api_id]) ? goals![awayTeam.api_id].length : 0) : 0,
                    } //JSON.parse(JSON.stringify(updated))
                });
            }else {
                await prisma.ecupResult.update({
                    where: {
                        api_id: ecupChamp.api_id as unknown as number,
                    },
                    data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
                });
            }
        }

        return {result: true, info: goals}

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

function getPeriod(gameStamp: number){
    return (Math.round(Date.now() / 1000) - Number(gameStamp))/3600 >= 12
}

function isFinishedOrLive(gameStamp: number){
    return Number(gameStamp) < Math.round(Date.now() / 1000)
}