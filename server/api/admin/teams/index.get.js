import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {
        const teams = [];

        const champsSnap= await db.collection('champs').get();

        const champs = champsSnap.docs.map((doc) => {

            const resTeams = doc.data().teams.map((team)=>{
                return {
                    ...team,
                    champ: doc.id,
                    champ_name: doc.data().champ.name
                }
            })

            teams.push(...resTeams);

            return doc.data().champ;
        });


       return {
           teams,
           champs
       }

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

})
