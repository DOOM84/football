import prisma from '~/helpers/prisma';
import type {ITag} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const tags = await prisma.tag.findMany({
            orderBy: {
                id: 'asc',
            },
        }) as ITag[];

        return {tags};

    }catch (e) {
        console.log(e);
    }

})