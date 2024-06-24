import prisma from '~/helpers/prisma';

import calendarTransformer from "~/utils/transformers/calendarTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import ecupTransformer from "~/utils/transformers/ecupTransformer";
import cupResultsTransformer from "~/utils/transformers/cupResultsTransformer";
import type {
    IChamp,
    ICup,
    ICupResult,
    ICupTeam,
    IEcup,
    IEcupResult,
    IEcupStand,
    IEcupTeam,
    ILeagueTeam,
    IResult,
    ITeam
} from "~/types/interfaces";
import type {Season} from "~/types/types";
import leagueCalendarTransformer from "~/utils/transformers/leagueCalendarTransformer";

export default defineEventHandler(async (event) => {

    try {

        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const {season, mode,
            champ, ecup, cup, league} = getQuery(event);

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

        if(mode === 'leagueStands'){

            const DBleague = await prisma.league.findFirst({
                where: {slug: league!.toString()}
            })

            const champTeams = await prisma.team.findMany({
                select: {id: true, api_id: true, slug: true}
            }) as unknown as ITeam[];

            const origTeams = await prisma.leagueTeam.findMany({
                include: {
                    team: {select: {id: true, api_id: true, slug: true}}
                }
            }) as unknown as ILeagueTeam[];

            const leagueTeams =  await (prisma[`leagueTeam${season as Season}`] as any).findMany({
                where: {champ_id: +DBleague!.id},
                orderBy: {
                    order: 'asc',
                },
            }) as unknown as ITeam[];

          return await Promise.all(leagueTeams.map(async (team: Record<string, any>) => {
              team.slug = origTeams.filter(t => +t.api_id === +team.api_id)[0]?.team?.slug || champTeams.filter(t => +t.api_id === +team.api_id)[0]?.slug || null;
              return team;
            }));
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

        if(mode === 'leagueResults'){

            const DBLeague = await prisma.league.findFirst({
                where: {slug: league!.toString()}
            }) as unknown as ILeague;

            const champTeams = await prisma.team.findMany({
                select: {id: true, api_id: true, slug: true}
            }) as unknown as ITeam[];

            const origTeams = await prisma.leagueTeam.findMany({
                include: {
                    team: {select: {id: true, api_id: true, slug: true}}
                }
            }) as unknown as ILeagueTeam[];

            const teams = await (prisma[`leagueTeam${season as Season}`] as any).findMany() as unknown as ILeagueTeam[];

            const DBresults = await (prisma[`leagueResult${season as Season}`] as any).findMany({
                where: {champ_id: +DBLeague!.id},
                orderBy: {
                    stamp: 'asc',
                },
            }) as unknown as ILeagueResult[];

            for (let i = 0; i < DBresults.length; i++) {
                DBresults[i].home = teams.filter(team => team.id === DBresults[i].team1)[0];
                DBresults[i].home.slug = origTeams.filter(t => +t.api_id === +DBresults[i].home.api_id)[0]?.team?.slug || champTeams.filter(t => +t.api_id === +DBresults[i].home.api_id)[0]?.slug || null;
                DBresults[i].away = teams.filter(team => team.id === DBresults[i].team2)[0];
                DBresults[i].away.slug = origTeams.filter(t => +t.api_id === +DBresults[i].away.api_id)[0]?.team?.slug || champTeams.filter(t => +t.api_id === +DBresults[i].away.api_id)[0]?.slug || null;
            }

            return leagueCalendarTransformer(DBresults);
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