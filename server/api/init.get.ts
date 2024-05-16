import prisma from '~/helpers/prisma';
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
        })

        const champs = await prisma.champ.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
            orderBy: {
                id: 'asc',
            },

        })


        return {ecups, champs};

    }catch (e) {
        console.log(e);
    }

})