import prisma from '~/helpers/prisma';

import calendarTransformer from "~/utils/transformers/calendarTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import ecupTransformer from "~/utils/transformers/ecupTransformer";
import cupResultsTransformer from "~/utils/transformers/cupResultsTransformer";
import type {IChamp, IEcup, IEcupResult, IEcupStand, IEcupTeam, IResult, ITeam, ICup} from "~/types/interfaces";
import type {Season} from "~/types/types";

export default defineEventHandler(async (event) => {

    try {

        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const {season, mode,
            champ, ecup, cup} = getQuery(event);

        if(mode === 'champResults'){

            const DBchamp = await prisma.champ.findFirst({
                where: {slug: champ!.toString()}
            }) as unknown as IChamp;

            const teams = await prisma.team.findMany({
                select: {id: true, slug: true, sprite: true, name: true}
            }) as unknown as ITeam[];

            const DBresults = await (prisma[`result${season as Season}`] as any).findMany({
                where: {champ_id: +DBchamp!.id},
                orderBy: {
                    stamp: 'asc',
                },
            }) as IResult[];

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

            return  await (prisma[`team${season as Season}`] as any).findMany({
                where: {champ_id: +DBchamp!.id},
               // select: {id: true, slug: true, sprite: true, name: true},
                orderBy: {
                    order: 'asc',
                },
            }) as unknown as ITeam[];
        }

        if(mode === 'cupResults'){

            const DBcup = await prisma.cup.findFirst({
                where: {slug: cup!.toString()}
            }) as unknown as ICup;

            const teams = await prisma.cupTeam.findMany({
                include: {
                    team: true
                }
            }) as unknown as ICupTeam[];

            const DBresults = await (prisma[`cupResult${season as Season}`] as any).findMany({
                where: {cup_id: +DBcup!.id},
                orderBy: {
                    stamp: 'asc',
                },
            }) as unknown as ICupResult[];

            for (let i = 0; i < DBresults.length; i++) {
                DBresults[i].home = teams.filter(team => team.id === DBresults[i].team1)[0]
                DBresults[i].away = teams.filter(team => team.id === DBresults[i].team2)[0]

            }

            return cupResultsTransformer(DBresults);
        }

        if(mode === 'ecupResults'){

            const DBecup = await prisma.ecup.findFirst({
                where: {slug: ecup!.toString()}
            }) as unknown as IEcup;

            const teams = await prisma.ecupTeam.findMany({
                include: {
                    team: true
                }
            }) as unknown as IEcupTeam[];

            const DBresults = await (prisma[`ecupResult${season as Season}`] as any).findMany({
                where: {ecup_id: +DBecup!.id},
                orderBy: {
                    stamp: 'asc',
                },
            }) as unknown as IEcupResult[];

            for (let i = 0; i < DBresults.length; i++) {
                DBresults[i].home = teams.filter(team => team.id === DBresults[i].team1)[0]
                DBresults[i].away = teams.filter(team => team.id === DBresults[i].team2)[0]

            }

            return singleEcupResultsTransformer(DBresults);
        }

        if(mode === 'ecupStands'){

            const DBecup = await prisma.ecup.findFirst({
                where: {slug: ecup!.toString()}
            }) as unknown as IEcup;

            const teams = await prisma.ecupTeam.findMany({
                include: {
                    team: true
                }
            })as unknown as IEcupTeam[];

            const DBstands = await (prisma[`ecupStand${season as Season}`] as any).findMany({
                where: {ecup_id: +DBecup!.id},
                orderBy: {
                    order: 'asc',
                },
            }) as IEcupStand[];

            for (let i = 0; i < DBstands.length; i++) {
                DBstands[i].ecupTeam = teams.filter(team => team.id === DBstands[i].team_id)[0]
            }
            return  ecupTransformer({stands: DBstands} as unknown as Partial<IEcup>);
        }

    }catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            message: 'Error occurred',
        });
    }

})