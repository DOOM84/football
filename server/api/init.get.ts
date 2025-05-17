import prisma from '~/helpers/prisma';
import type {IChamp, IEcup} from "~/types/interfaces";
export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const ecups = await prisma.ecup.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
            orderBy: {
                id: 'asc',
            },
        }) as unknown as IEcup[];

        const champs = await prisma.champ.findMany({
            include: {
                cups: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                },
                leagues: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            },
            orderBy: {
                id: 'asc',
            },

        }) as unknown as IChamp[];


        return {ecups, champs};

    }catch (e) {
        console.log(e);
    }

})