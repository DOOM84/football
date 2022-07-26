import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {teams} = useQuery(event);

        const players = [];

        if(!JSON.parse(teams).length) return players;

        await Promise.all(JSON.parse(teams).map(async (team) => {

            const teamPlayers = await db.collection('squads').doc(team).get();

            if(teamPlayers.exists){
                teamPlayers.data().players.map((player)=>{
                    players.push({
                        name: player.name,
                        slug: player.slug,
                    })
                })
            }
        }))

        return players;

    }catch (e) {
         console.log(e);
    }

})
