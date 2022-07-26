import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {
        const teams = [];

        const champsSnap= await db.collection('champs').get();

        champsSnap.docs.map((doc) => {

            const resTeams = doc.data().teams.map((team)=>{
                return {
                    api_id: team.api_id,
                    name: team.name,
                    slug: team.slug,
                    sprite: team.sprite,
                }
            })

            teams.push(...resTeams);
        });

        const ecupTeams = (await db.collection('ecup_teams')
            .doc('teams').get()).data().teams;

       return {
           teams,
           ecupTeams
       }

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
    }

})
