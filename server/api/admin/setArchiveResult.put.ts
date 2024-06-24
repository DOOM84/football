import prisma from '~/helpers/prisma';
import type {IError} from "~/types/interfaces";
import {matchInfo, matchSquads} from "~/helpers/remoteApi";
import type {Season} from "~/types/types";



export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const updated = await readBody(event);

        if(!updated.season){ return {}}

        const resChamp =  await (prisma[`result${updated.season as Season}`] as any).findFirst({
            where: {
                api_id: +updated.api_id
            }
        })

        const ecupChamp =  await (prisma[`ecupResult${updated.season as Season}`] as any).findFirst({
            where: {
                api_id: +updated.api_id
            }
        })

        const cupChamp =  await (prisma[`cupResult${updated.season as Season}`] as any).findFirst({
            where: {
                api_id: +updated.api_id
            }
        })

        const leagueChamp =  await (prisma[`leagueResult${updated.season as Season}`] as any).findFirst({
            where: {
                api_id: +updated.api_id
            }
        })

        if(updated.is_info){
            const events = await matchInfo(updated.api_id);
            const squads = await matchSquads(updated.api_id);

                events.map(event =>{
                    if(event.type.toLowerCase() === 'subst'){
                        const assist = {...event.assist}
                        event.assist = {...event.player};
                        event.player = assist;
                    }
                    return event;
                })

            await prisma[`matchInfo${updated.season as Season}`].create({
                data: {
                    ch_res: resChamp ? resChamp.api_id : null,
                    ecup_res: ecupChamp ? ecupChamp.api_id : null,
                    c_res: cupChamp ? cupChamp.api_id : null,
                    l_res: leagueChamp ? leagueChamp.api_id : null,
                    info: events,
                    lineups: squads,
                }
            })
        }else{
            await (prisma[`matchInfo${updated.season as Season}`] as any).delete({
                where: {
                    ...(resChamp ? { ch_res: resChamp.api_id } : {}) as any,
                    ...(ecupChamp ? { ecup_res: ecupChamp.api_id } : {}) as any,
                    ...(cupChamp ? { c_res: cupChamp.api_id } : {}) as any,
                    ...(leagueChamp ? { l_res: leagueChamp.api_id } : {}) as any,
                }
            })
        }

        if(resChamp){
            await (prisma[`result${updated.season as Season}`] as any).update({
                where: {
                    api_id: resChamp.api_id,
                },
                data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
            });
        }


        if(ecupChamp){
            await (prisma[`ecupResult${updated.season as Season}`] as any).update({
                where: {
                    api_id: ecupChamp.api_id,
                },
                data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
            });
        }

        if(cupChamp){
            await (prisma[`cupResult${updated.season as Season}`] as any).update({
                where: {
                    api_id: cupChamp.api_id,
                },
                data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
            });
        }

        if(leagueChamp){
            await (prisma[`leagueResult${updated.season as Season}`] as any).update({
                where: {
                    api_id: leagueChamp.api_id,
                },
                data: {is_info: updated.is_info} //JSON.parse(JSON.stringify(updated))
            });
        }

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

function getPeriod(gameStamp: number){
    return (Math.round(Date.now() / 1000) - Number(gameStamp))/3600 >= 12
}

function isFinishedOrLive(gameStamp: number){
    return Number(gameStamp) < Math.round(Date.now() / 1000)
}