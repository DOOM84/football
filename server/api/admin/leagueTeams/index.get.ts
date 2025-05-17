import prisma from '~/helpers/prisma';
import type {ILeagueTeam, ITeam, ILeague} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const leagueTeams = await prisma.leagueTeam.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                team: true,
                champ: true
            }
        }) as unknown as ILeagueTeam[];

        const teams  = await prisma.team.findMany({
          //  select: {slug: true, name: true, id: true},
            orderBy: {
                name: 'asc',
            },
        }) as unknown as ITeam[];

        const champs = await prisma.league.findMany({
            select: {slug: true, name: true, id: true},
            orderBy: {
                id: 'asc',
            },
        }) as unknown as ILeague[];

        return {leagueTeams, teams, champs};

    }catch (e) {
        console.log(e);
    }

})