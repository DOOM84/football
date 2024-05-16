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
        })

        const ecups = await prisma.ecup.findMany({
            orderBy: {
                id: 'asc',
            },
        })

        return {champs, ecups}

    }catch (e) {
        console.log(e);
    }

})