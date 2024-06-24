import {addLeagueStands} from "~/helpers/remoteApi";
import prisma from '~/helpers/prisma';
import type {ILeague, IError} from "~/types/interfaces";

export default defineEventHandler(async (event) => {

    try {

        const {slug, id, api_id} = await readBody(event);

        const rawStands = await addLeagueStands(+api_id) as Record<string, any>[];

        if(!rawStands.length) {
            return []
        }

        const teams = await prisma.team.findMany({
            select: {
                id: true,
                api_id: true,
                name: true,
                sprite: true
            }
        })


        return await Promise.all(rawStands.map(async (team: Record<string, any>) => {

            const origTeam = teams.filter(t => +team.team.id === +t.api_id)[0];

            await prisma.leagueTeam.upsert({
                where: {api_id: +team.team.id},
                update: {
                    games : team.all.played,
                    win : team.all.win,
                    draw : team.all.draw,
                    lost : team.all.lose,
                    goals : team.all.goals.for,
                    missed : team.all.goals.against,
                    diff : team.goalsDiff,
                    points : team.points,
                    order : team.rank,
                },
                create: {
                    api_id: team.team.id,
                    name: origTeam ? origTeam.name : team.team.name,
                    champ_id: id,
                    team_id: origTeam ? +origTeam.id : null,
                    sprite: origTeam ? origTeam.sprite : null,
                    games : team.all.played,
                    win : team.all.win,
                    draw : team.all.draw,
                    lost : team.all.lose,
                    goals : team.all.goals.for,
                    missed : team.all.goals.against,
                    diff : team.goalsDiff,
                    points : team.points,
                    order : team.rank,
                },
            })
        }));

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
