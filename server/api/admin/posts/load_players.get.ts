import prisma from '~/helpers/prisma';
import type {ITeam} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query = getQuery(event);

        const teams = JSON.parse(query.teams as string)

       const teamsWithPlayers = await prisma.team.findMany({
            where: {
                slug: { in: teams },
            },
            include: {
                players: {
                    select: {name: true, slug: true, img: true, id: true},
                    orderBy: {
                        name: 'asc',
                    },
                }
            }

        }) as unknown as ITeam[];

        return [].concat(...teamsWithPlayers.map(team => team.players) as any[])

    }catch (e) {
        console.log(e);
    }

})