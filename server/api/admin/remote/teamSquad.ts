import prisma from '~/helpers/prisma';
import {addTeamSquad} from "~/helpers/remoteApi";
import slugify from "slugify";
export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

        const existingPlayers = await prisma.player.findMany({
            where: {team_id: +query.teamId!},
            select: {api_id: true}
        })

        const players = await addTeamSquad(+query.teamApiId!, +query.teamId!) as any[];

        for(let i= 0; i < existingPlayers.length; i++){
            const ind = players.findIndex((player) => +existingPlayers[i].api_id === +player.api_id)
             if(ind < 0){
                 await prisma.player.update({
                     where: {
                         api_id: +existingPlayers[i].api_id,
                     },
                     data: {team_id: null}
                 });
             }
        }

        for(let i= 0; i < players.length; i++){

          const updatedPlayer =   await prisma.player.upsert({
                where: { api_id: players[i].api_id },
                update: {...players[i]},
                create: {...players[i], slug: await getPlayerSlug(slugify(players[i].name as string, {strict: true, lower:true}), players[i].api_id, 0)}
            })


            players[i].slug = updatedPlayer.slug
            players[i].position = getPosition(updatedPlayer.position_id)
        }

        return {players}

    }catch (e) {
        console.log(e);
    }

})

async function getPlayerSlug(playerSlug: string, playerApiId: number, flag: number): Promise<string>{

    const player = await prisma.player.findFirst({
        where: {
            slug: playerSlug,
            NOT: {
                api_id: +playerApiId,
            },
        },
    })

    if(player?.id){
        flag += 1;
        const newPlayerSlug = playerSlug+'-'+flag;
        return await getPlayerSlug(newPlayerSlug, playerApiId, flag)
    }
    return playerSlug;
}

function getPosition(positionId: number) {
    return positionId === 1
        ? 'Голкипер' : positionId === 2 ? 'Защитник' :
            positionId === 3 ? 'Полузащитник' : positionId === 4 ? 'Нападающий' : ''
}