import prisma from '~/helpers/prisma';
import type {IEcup} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const ecups = await prisma.ecup.findMany({
            orderBy: {
                name: 'asc',
            },
        }) as unknown as IEcup[];

        return {ecups};

    }catch (e) {
        console.log(e);
    }

})