import prisma from '~/helpers/prisma';

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const teams = await prisma.team.findMany({
            include: {
                players: {
                    orderBy: {
                        position_id: 'asc',
                    },
                },
                champ: true,
            }
        })

        const champs = await prisma.champ.findMany({
            select: {slug: true, name: true, id: true},
            orderBy: {
                id: 'asc',
            },
        });

        return {teams, champs};

    }catch (e) {
        console.log(e);
    }

})