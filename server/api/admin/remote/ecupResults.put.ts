import {addEcupResults} from "~/helpers/remoteApi";
import type {IEcupResult, IEcupStand, IEcupTeam, IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
import moment from "moment";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";


export default defineEventHandler(async (event) => {

    const {slug, id, api_id} = await readBody(event);

    try {

        if (slug && api_id) {

            const ecup_teams = await prisma.ecupTeam.findMany({
                include: {
                    team: {select: {slug: true, id: true, api_id: true, name: true, sprite: true}}
                }
            }) as unknown as IEcupTeam[];

            const results = await addEcupResults(+api_id) as Record<string, any>[];

            let groupFiltered = results.filter(res => res.league.round.toLowerCase().includes('group'));

            groupFiltered = groupFiltered.length ? groupFiltered : results.filter(res => res.league.round.toLowerCase().includes('stage'));

            const poFiltered = results.filter(res =>
                res.league.round.toLowerCase().includes('knockout round play-offs') ||
                res.league.round.toLowerCase().includes('round of 16') ||
                res.league.round.toLowerCase().includes('quarter-finals') ||
                res.league.round.toLowerCase().includes('semi-finals') ||
                res.league.round.toLowerCase() === 'final'
            );

            const groupRes = await Promise.all(groupFiltered.map(async res => {

                const team1 = ecup_teams.filter(team => team.api_id === +res.teams.home.id)[0];
                const team2 = ecup_teams.filter(team => team.api_id === +res.teams.away.id)[0];

                const stand = await prisma.ecupStand.findFirst({
                    where: {
                        team_id: +team1!.id,
                        AND: [
                            {
                                ecup_id: +id
                            },
                        ],
                    },

                }) as unknown as IEcupStand;

                return {
                    date: moment(res.fixture.timestamp * 1000).startOf('day').valueOf(),
                    res1: res.goals.home,
                    res2: res.goals.away,
                    ecup_id: +id,
                    team1: team1!.id,
                    team2: team2!.id,
                    time: res.fixture.timestamp.toString(),
                    stamp: res.fixture.timestamp,
                    api_id: +res.fixture.id,
                    //is_info: res.is_info,
                    tour: +res.league.round.slice(-1),
                    group: stand?.group || null,
                    stage: null
                }
            }));

            const poRes = await Promise.all(poFiltered.map(async res => {

                const team1 = ecup_teams.filter(team => team.api_id === +res.teams.home.id)[0];
                const team2 = ecup_teams.filter(team => team.api_id === +res.teams.away.id)[0];

                return {
                    date: moment(res.fixture.timestamp * 1000).startOf('day').valueOf(),
                    res1: res.goals.home,
                    res2: res.goals.away,
                    ecup_id: +id,
                    team1: team1!.id,
                    team2: team2!.id,
                    time: res.fixture.timestamp.toString(),
                    stamp: res.fixture.timestamp,
                    api_id: +res.fixture.id,
                    tour: +res.league.round.slice(-1),
                    group: null,
                    stage: getStage(res.league.round.toLowerCase())
                }
            }));

            const allRes = groupRes.concat(poRes as any[]);

            for (let i = 0; i < allRes.length; i++) {

                await prisma.ecupResult.upsert({
                    where: { api_id: +allRes[i].api_id },
                    update: allRes[i],
                    create: allRes[i],
                })
            }

            const dbRes = await prisma.ecupResult.findMany({
                where: {ecup_id: +id},
                orderBy: {
                    stamp: 'asc',
                },
            }) as unknown as IEcupResult[]

            for (let i = 0; i < dbRes.length; i++) {
                dbRes[i].home = ecup_teams.filter(team => team.id === +dbRes[i].team1)[0];
                dbRes[i].away = ecup_teams.filter(team => team.id === +dbRes[i].team2)[0];
            }
            const {groupResults, poResults} =
                singleEcupResultsTransformer(dbRes);

            return {results: {groupResults, poResults, ecup: slug}}


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
        case 'knockout round play-offs':
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
