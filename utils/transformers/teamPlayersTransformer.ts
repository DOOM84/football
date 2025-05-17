import type {IPlayer} from "~/types/interfaces";
import getPosition from "~/utils/getPosition";

export default ((players: IPlayer[]): Partial<IPlayer>[] => {

   return  players.map((player: IPlayer): Partial<IPlayer> => {
       return {
          name: player.name,
          slug: player.slug,
          img: player.img,
          team: player.team,
          number: player.info?.number,
          position: getPosition(player.position_id)
       }

   }) as Partial<IPlayer>[]

})
