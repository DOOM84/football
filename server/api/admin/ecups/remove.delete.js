import {
    getFirestore
} from "firebase-admin/firestore";
const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        const slug = await useBody(event);

        await db.collection('ecups').doc(slug).delete();

        return {id: slug}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})