import prisma from '~/helpers/prisma';
import type {IChamp, ICup} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const cups = await prisma.cup.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                champ: {
                    select: {slug: true, name: true, id: true},
                }
            },
        }) as unknown as ICup[];

        const champs = await prisma.champ.findMany({
            select: {slug: true, name: true, id: true},
            orderBy: {
                id: 'asc',
            },
        }) as unknown as IChamp[];

        return {cups, champs};

    }catch (e) {
        console.log(e);
    }

})