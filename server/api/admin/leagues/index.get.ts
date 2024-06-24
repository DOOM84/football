import prisma from '~/helpers/prisma';
import type {IChamp, ILeague} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const leagues = await prisma.league.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                champ: {
                    select: {slug: true, name: true, id: true},
                }
            },
        }) as unknown as ILeague[];

        const champs = await prisma.champ.findMany({
            select: {slug: true, name: true, id: true},
            orderBy: {
                id: 'asc',
            },
        }) as unknown as IChamp[];

        return {leagues, champs};

    }catch (e) {
        console.log(e);
    }

})