import {IPlayer} from "~/types/interfaces";

export default ((players: IPlayer[]): Partial<IPlayer>[] => {

   return  players.map((player: IPlayer): Partial<IPlayer> => {
       return {
          name: player.name,
          slug: player.slug,
          img: player.img,
          team: player.team,
          number: player.info?.number as number,
          position: getPosition(player.position_id as number)
       }

   }) as Partial<IPlayer>[]

})

function getPosition(positionId: number) {
    return positionId === 1
        ? 'Голкипер' : positionId === 2 ? 'Защитник' :
            positionId === 3 ? 'Полузащитник' : positionId === 4 ? 'Нападающий' : ''
}
