import prisma from '~/helpers/prisma';
import type {IChamp, IEcup} from "~/types/interfaces";
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

        return {champs, ecups}

    }catch (e) {
        console.log(e);
    }

})