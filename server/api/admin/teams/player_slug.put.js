import {
    getFirestore
} from "firebase-admin/firestore";
const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const {playerId, playerSlug, teamSlug} = await useBody(event);

        const team = (await db.collection('squads').doc(teamSlug).get()).data();

        const ind = team.players.findIndex(player => +player.id === +playerId);

        if(ind > -1){
            team.players[ind].slug = playerSlug;
            await db.collection('squads').doc(teamSlug).update({players: team.players});
        }

        return {id: playerId}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})