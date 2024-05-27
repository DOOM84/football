import prisma from '~/helpers/prisma';

import calendarTransformer from "~/utils/transformers/calendarTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import ecupTransformer from "~/utils/transformers/ecupTransformer";

export default defineEventHandler(async (event) => {

    try {

        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const {season, mode, champ, ecup} = getQuery(event);

        if(mode === 'champResults'){
            const DBchamp = await prisma.champ.findFirst({
                where: {slug: champ!.toString()}
            })
            const teams = await prisma.team.findMany({
                select: {id: true, slug: true, sprite: true, name: true}
            });

            const DBresults = await prisma[`result${season}`].findMany({
                where: {champ_id: +DBchamp!.id},
                orderBy: {
                    stamp: 'asc',
                },
            });

            for (let i = 0; i < DBresults.length; i++) {
                DBresults[i].home = teams.filter(team => team.id === DBresults[i].team1)[0]
                DBresults[i].away = teams.filter(team => team.id === DBresults[i].team2)[0]

            }
            return  calendarTransformer(DBresults);
        }

        if(mode === 'champStands'){

            const DBchamp = await prisma.champ.findFirst({
                where: {slug: champ!.toString()}
            })

            return  await prisma[`team${season}`].findMany({
                where: {champ_id: +DBchamp!.id},
               // select: {id: true, slug: true, sprite: true, name: true},
                orderBy: {
                    order: 'asc',
                },
            });
        }

        if(mode === 'ecupResults'){

            const DBecup = await prisma.ecup.findFirst({
                where: {slug: ecup!.toString()}
            })

            const teams = await prisma.ecupTeam.findMany({
                include: {
                    team: true
                }
            });

            const DBresults = await prisma[`ecupResult${season}`].findMany({
                where: {ecup_id: +DBecup!.id},
                orderBy: {
                    stamp: 'asc',
                },
            });

            for (let i = 0; i < DBresults.length; i++) {
                DBresults[i].home = teams.filter(team => team.id === DBresults[i].team1)[0]
                DBresults[i].away = teams.filter(team => team.id === DBresults[i].team2)[0]

            }

            return singleEcupResultsTransformer(DBresults);
        }

        if(mode === 'ecupStands'){

            const DBecup = await prisma.ecup.findFirst({
                where: {slug: ecup!.toString()}
            })

            const teams = await prisma.ecupTeam.findMany({
                include: {
                    team: true
                }
            });

            const DBstands = await prisma[`ecupStand${season}`].findMany({
                where: {ecup_id: +DBecup!.id},
                orderBy: {
                    order: 'asc',
                },
            });

            for (let i = 0; i < DBstands.length; i++) {
                DBstands[i].ecupTeam = teams.filter(team => team.id === DBstands[i].team_id)[0]
            }
            return  ecupTransformer({stands: DBstands});
        }

    }catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            message: 'Error occurred',
        });
    }

})