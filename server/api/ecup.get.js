import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {ecup, count} = useQuery(event);

        const ecupSnap = await db.collection('ecups').doc(ecup).get();

        if (!ecupSnap.exists) {

            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const posts = await $fetch('/api/ecup_posts', {params: {ecup, count:+count}});

        const {playOff, group} = await $fetch('/api/ecup_results', {params: {ecup}});

            const headlinesSnap = await db.collection('posts').orderBy('date', 'desc')
                .where('ecup', '==', ecup).where('is_headline', '==', true)
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

        return {posts, headlines, playOff, group, ecupName: ecupSnap.data().name}

        }catch (e) {
        // console.log(e);
    }

})

