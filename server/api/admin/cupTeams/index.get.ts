import prisma from '~/helpers/prisma';
import type {ICupTeam, ITeam} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const cupTeams = await prisma.cupTeam.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                team: true
            }
        }) as unknown as ICupTeam[];

        const teams  = await prisma.team.findMany({
          //  select: {slug: true, name: true, id: true},
            orderBy: {
                name: 'asc',
            },
        }) as unknown as ITeam[];

        return {cupTeams, teams};

    }catch (e) {
        console.log(e);
    }

})