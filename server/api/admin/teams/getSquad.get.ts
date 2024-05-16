import prisma from '~/helpers/prisma';
export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

       const team = await prisma.team.findFirst({
            where: {
                id: +query.teamId!,
            },
            include: {
                players: {
                    orderBy: {
                        position_id: 'asc',
                    },
                }
                }
       })


        return {players: team?.players.map((player: { position_id: number; }) => ({...player, position: getPosition(player.position_id)}))}

    }catch (e) {
        console.log(e);
    }

})

function getPosition(positionId: number) {
    return positionId === 1
        ? 'Голкипер' : positionId === 2 ? 'Защитник' :
            positionId === 3 ? 'Полузащитник' : positionId === 4 ? 'Нападающий' : ''
}