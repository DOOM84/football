import {addLeagueResults} from "~/helpers/remoteApi";
import type {IError, ILeagueTeam} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
import moment from "moment";
export default defineEventHandler(async (event) => {

    const {slug, id, api_id} = await readBody(event);

    try {

        if (slug && api_id) {

            const results = await addLeagueResults(+api_id) as Record<string, any>[];

            const leagueTeams = await prisma.leagueTeam.findMany({
                include: {
                    team: {select: {id: true, api_id: true, name: true, sprite: true}}
                }
            }) as unknown as ILeagueTeam[];

            return await Promise.all(results.map(async res => {

                const team1 = leagueTeams.filter(team => team.api_id === +res.teams.home.id)[0];
                const team2 = leagueTeams.filter(team => team.api_id === +res.teams.away.id)[0];

                let homeId = undefined;
                let awayId = undefined;

                if (!team1) {
                    const {id: tId} = await prisma.leagueTeam.upsert({
                        where: {api_id: +res.teams.home.id},
                        update: {api_id: +res.teams.home.id},
                        create: {
                            api_id: +res.teams.home.id,
                            name: res.teams.home.name,
                            champ_id: id,
                        },
                    })

                    homeId = tId;
                }

                if (!team2) {
                    const {id: tId} = await prisma.leagueTeam.upsert({
                        where: {api_id: +res.teams.away.id},
                        update: {api_id: +res.teams.away.id},
                        create: {
                            api_id: +res.teams.away.id,
                            name: res.teams.away.name,
                            champ_id: id,
                        },
                    })
                    awayId = tId;
                }

                const finalRes = {
                    date: moment(res.fixture.timestamp * 1000).startOf('day').valueOf(),
                    res1: res.goals.home,
                    res2: res.goals.away,
                    team1: team1?.id || homeId!,
                    team2: team2?.id || awayId!,
                    champ_id: id,
                    tour: !parseInt(res?.league?.round.split(" ")[3]) || !/^\d+$/.test(res?.league?.round.split(" ")[3]) ? 99 : +res.league.round.split(" ")[3],
                    stamp: res.fixture.timestamp,
                    //time: res.fixture.timestamp.toString(),
                    api_id: +res.fixture.id,
                };

                await prisma.leagueResult.upsert({
                    where: {api_id: +finalRes.api_id},
                    update: finalRes,
                    create: finalRes,
                })

                return finalRes;

            }));


        } else {
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
