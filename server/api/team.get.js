import { getFirestore} from 'firebase-admin/firestore';
const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {team, count} = useQuery(event);

        let players = [];

        const posts = await $fetch('/api/team_posts',{params: {team, count}});

        let squad = (await db.collection('squads').doc(team).get()).data();

        if(squad){
            players = squad.players.sort((a,b)=> (a.position_id - b.position_id));
        }

        return {
            posts,
            players
        }


    }catch (e) {
         console.log(e);
    }

})
