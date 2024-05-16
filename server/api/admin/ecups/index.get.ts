import prisma from '~/helpers/prisma';

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
        })

        return {ecups};

    }catch (e) {
        console.log(e);
    }

})