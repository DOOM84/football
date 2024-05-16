import prisma from '~/helpers/prisma';

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
            //take: 5
        })

        return {champs};

    }catch (e) {
        console.log(e);
    }

})