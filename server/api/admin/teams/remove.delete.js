import {
    getFirestore
} from "firebase-admin/firestore";
import setFilePath from "~/helpers/upload/setFilePath";
const db = getFirestore();
import fs from "fs";


export default defineEventHandler(async (event) => {

    try {

        const {slug, champ} = await useBody(event);

        const compet = (await db.collection('champs').doc(champ).get()).data();

        const teams = compet.teams;

        const ind = compet.teams.findIndex(team => team.slug === slug);

        if(teams[ind].img){
            if (fs.existsSync(setFilePath('/public' + teams[ind].img))) {
                fs.unlinkSync(setFilePath('/public' + teams[ind].img));
            }
        }

        teams.splice(ind, 1);

        await db.collection('champs').doc(champ).update({teams});

        await db.collection('squads').doc(slug).delete();

        await db.collection('team_posts').doc(slug).delete();

        return {id: slug}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})