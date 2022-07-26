import {
    getFirestore
} from "firebase-admin/firestore";
const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const api_id = await useBody(event);

        const ecupTeams = (await db.collection('ecup_teams')
            .doc('teams').get()).data().teams;

        ecupTeams.splice(ecupTeams.findIndex(item => +item.api_id === +api_id), 1);

        await db.collection('ecup_teams').doc('teams').update({teams: ecupTeams});

        return {id: api_id}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})