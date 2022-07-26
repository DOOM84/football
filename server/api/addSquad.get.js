import { getFirestore} from 'firebase-admin/firestore';
import {addPlayerInfo, /*addTeamSquad*/} from "~/helpers/remoteApi";

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {api_id, team, playerSlug} = useQuery(event);

        await addPlayerInfo(api_id, team, playerSlug);

        return {}


        }catch (e) {
         console.log(e);
    }

})

