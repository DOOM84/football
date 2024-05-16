import prisma from '~/helpers/prisma';

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const ecupTeams = await prisma.ecupTeam.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                team: true
            }
        })

        const teams  = await prisma.team.findMany({
          //  select: {slug: true, name: true, id: true},
            orderBy: {
                name: 'asc',
            },
        });

        return {ecupTeams, teams};

    }catch (e) {
        console.log(e);
    }

})