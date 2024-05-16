import {IPlayer} from "~/types/interfaces";

export default ((player: IPlayer["player"]): Partial<IPlayer> => {

    delete player.posts;

    return {
        id: player.id,
        country: player.country?.name as string,
        name: player.name,
        info: player.info,
        //slug: player.slug,
        img: player.img,
        number: player.info?.number as number,
        team: {
            name: player.team?.name,
            slug: player.team?.slug,
            sprite: player.team?.sprite,
        },
        position: getPosition(player.position_id)
    }

})

function getPosition(positionId: number) {
    return positionId === 1
        ? 'Голкипер' : positionId === 2 ? 'Защитник' :
            positionId === 3 ? 'Полузащитник' : positionId === 4 ? 'Нападающий' : ''
}
