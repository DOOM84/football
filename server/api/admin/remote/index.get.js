import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {
        const teams = [];

        const ecupsSnap= await db.collection('ecups').get();
        const competsSnap= await db.collection('compets').get();

        const ecups = ecupsSnap.docs.map((doc) => {
            return doc.data();
        });

        const champs = competsSnap.docs.map((doc) => {
            return doc.data();
        });

       return {
           teams,
           champs,
           ecups,
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
