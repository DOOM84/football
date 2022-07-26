import {addPlayerInfo} from "~/helpers/remoteApi";

export default defineEventHandler(async (event) => {
    try {
        let {api_id, team, playerId} = useQuery(event);

        await addPlayerInfo(api_id, team, playerId);

        return {}


        }catch (e) {
         console.log(e);
    }

})

