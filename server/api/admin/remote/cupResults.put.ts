import {addCupResults} from "~/helpers/remoteApi";
import type {IError, ICupTeam} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
import moment from "moment";

const rounds = {
    45: ['5th round', '4th round', '3rd round', 'quarter-finals', 'semi-finals', 'final'],
    48: ['2nd round', '3rd round', 'round of 16', 'quarter-finals', 'semi-finals', 'final'],
    143: ['2nd round', 'round of 32', 'round of 16', 'quarter-finals', 'semi-finals', 'final'],
    66: ['round of 64', 'round of 32', 'round of 16', 'quarter-finals', 'semi-finals', 'final'],
    96: ['3rd round', '4th round', 'round of 16', 'quarter-finals', 'semi-finals', 'final'],
};
export default defineEventHandler(async (event) => {

    const {slug, id, api_id} = await readBody(event);

    try {

        if (slug && api_id) {

            const rawResults = await addCupResults(+api_id) as Record<string, any>[];

            const cup_teams = await prisma.cupTeam.findMany({
                include: {
                    team: {select: {id: true, api_id: true, name: true, sprite: true}}
                }
            }) as unknown as ICupTeam[];

            const results = rawResults.map(res => {
                return {...res, round: res.league.round, api_id: +api_id}
            }).filter(res => rounds[res.api_id as keyof typeof rounds] ? rounds[res.api_id as keyof typeof rounds].includes(res.round.toLowerCase()) : true) as Record<string, any>[];

            return await Promise.all(results.map(async res => {

                const team1 = cup_teams.filter(team => team.api_id === +res.teams.home.id)[0];
                const team2 = cup_teams.filter(team => team.api_id === +res.teams.away.id)[0];

                let homeId = undefined;
                let awayId = undefined;

                if (!team1) {
                    const {id} = await prisma.cupTeam.upsert({
                        where: {api_id: +res.teams.home.id},
                        update: {api_id: +res.teams.home.id},
                        create: {
                            api_id: +res.teams.home.id,
                            name: res.teams.home.name,
                        },
                    })

                    homeId = id;
                }

                if (!team2) {
                    const {id} = await prisma.cupTeam.upsert({
                        where: {api_id: +res.teams.away.id},
                        update: {api_id: +res.teams.away.id},
                        create: {
                            api_id: +res.teams.away.id,
                            name: res.teams.away.name,
                        },
                    })
                    awayId = id;
                }

                const finalRes = {
                    date: moment(res.fixture.timestamp * 1000).startOf('day').valueOf(),
                    res1: res.goals.home,
                    res2: res.goals.away,
                    team1: team1?.id || homeId!,
                    team2: team2?.id || awayId!,
                    stamp: res.fixture.timestamp,
                    time: res.fixture.timestamp.toString(),
                    cup_id: +id,
                    api_id: +res.fixture.id,
                    stage: getStage(res.league.round.toLowerCase())
                };

                await prisma.cupResult.upsert({
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

function getStage(round: string) {
    switch (round) {
        case '5th round':
            return '5-й круг';
        case 'preliminary round':
            return 'Предварительный раунд';
        case '4th round':
            return '4-й круг';
        case '3rd round':
            return '3-й круг';
        case '2nd round':
            return '2-й круг';
        case '1st round':
            return '1-й круг';
        case 'round of 64':
            return '1/32 финала';
        case 'round of 32':
            return '1/16 финала';
        case 'round of 16':
            return '1/8 финала';
        case 'quarter-finals':
            return '1/4 финала';
        case 'semi-finals':
            return '1/2 финала';
        case 'final':
            return 'Финал';
        default:
            return round;
    }
}
