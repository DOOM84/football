import prisma from '~/helpers/prisma';
import type {IChamp, ICup, IEcup, ILeague} from "~/types/interfaces";
export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const champs = await prisma.champ.findMany({
            orderBy: {
                name: 'asc',
            },
        }) as unknown as IChamp[];

        const ecups = await prisma.ecup.findMany({
            orderBy: {
                id: 'asc',
            },
        }) as unknown as IEcup[];

        const cups = await prisma.cup.findMany({
            orderBy: {
                id: 'asc',
            },
        }) as unknown as ICup[];

        const divs = await prisma.league.findMany({
            orderBy: {
                id: 'asc',
            },
        }) as unknown as ILeague[];

        return {champs, ecups, cups, divs}

    }catch (e) {
        console.log(e);
    }

})