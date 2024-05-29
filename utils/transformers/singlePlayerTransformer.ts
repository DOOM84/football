import type {ICountry, IPlayer} from "~/types/interfaces";
import getPosition from "~/utils/getPosition";

export default ((player: Partial<IPlayer>): Partial<IPlayer> => {

    delete player.posts;

    return {
        id: player.id,
        country: (player.country as ICountry)?.name as string,
        name: player.name,
        info: player.info,
        //slug: player.slug,
        img: player.img,
        number: player.info?.number,
        team: {
            name: player.team?.name,
            slug: player.team?.slug,
            sprite: player.team?.sprite,
        },
        position: getPosition(player.position_id!)
    }

})
