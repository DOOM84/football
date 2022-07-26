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

        let postsSnap = await db.collection('posts').orderBy('date', 'desc')
            .where('ecup', '==', ecup).where('status', '==', true)
            .limit(+count).get();

        return postsSnap.docs.map((doc) => {

            return {
                //champ: doc.data().champ,
                //champ_name: doc.data().champ_name,
                date: doc.data().date,
                ecup: doc.data().ecup,
                ecup_name: doc.data().ecup_name,
                images: doc.data().images,
                slug: doc.data().slug,
                title: doc.data().title,
            }

        })

    }catch (e) {
        // console.log(e);
    }

})
