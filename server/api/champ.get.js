import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {champ, count} = useQuery(event);

        const champSnap = await db.collection('compets').doc(champ).get();

        if (!champSnap.exists) {

            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const posts = await $fetch('/api/champ_posts', {params: {champ, count:+count}})


            const headlinesSnap = await db.collection('posts').orderBy('date', 'desc')
                .where('champ', '==', champ).where('is_headline', '==', true)
                .where('status', '==', true)
                .limit(4).get();

            const headlines = headlinesSnap.docs.map((doc) => {
                return {
                    images: doc.data().images,
                    slug: doc.data().slug,
                    champ: doc.data().champ,
                    ecup: doc.data().ecup,
                    title: doc.data().title,
                }
            })

        return {posts, headlines, champName: champSnap.data().name}

        }catch (e) {
         //console.log(e);
        event.res.statusCode = 404;
        event.res.end('Not found');
    }

})

