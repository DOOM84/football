import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        const headlinesSnap = await db.collection('posts').orderBy('date', 'desc')
            .where('is_headline', '==', true).where('status', '==', true)
            .limit(4).get();

        const postsSnap = await db.collection('posts').orderBy('date', 'desc')
            .where('status', '==', true)
            .limit(15).get();

        const posts = postsSnap.docs.map((doc) => {

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


        const headlines = headlinesSnap.docs.map((doc) => {
            return {
                images: doc.data().images,
                slug: doc.data().slug,
                champ: doc.data().champ,
                ecup: doc.data().ecup,
                title: doc.data().title,
            }
        })

        return {posts, headlines}

    } catch (e) {
        console.log(e);
    }

})
