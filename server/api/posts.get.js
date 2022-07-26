
import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        const postsSnap = await db.collection('posts').orderBy('date', 'desc')
            .where('status', '==', true)
            .limit(28).get();

        return postsSnap.docs.map((doc) => {

            return {
                champ: doc.data().champ,
                champ_name: doc.data().champ_name,
                date: doc.data().date,
                ecup: doc.data().ecup,
                ecup_name: doc.data().ecup_name,
                images: doc.data().images,
                slug: doc.data().slug,
                title: doc.data().title,
            }
        })


    } catch (e) {
        console.log(e);
    }

})
