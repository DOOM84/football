import {addTeamSquad} from "~/helpers/remoteApi";

export default defineEventHandler(async (event) => {
    try {
        let {api_id, team} = useQuery(event);

        return await addTeamSquad(api_id, team);

        }catch (e) {
         console.log(e);
    }

})

