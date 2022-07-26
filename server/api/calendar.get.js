import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {champ} = useQuery(event);

        const champSnap = await db.collection('compets').doc(champ).get();

        if (!champSnap.exists) {

            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const calendar = await $fetch('/api/results', {params: {champ}})

        const champPosts = await $fetch('/api/champ_posts', {params: {champ, count:10}})

        return {
            calendar,
            champPosts,
            champName: champSnap.data().name
        };

    }catch (e) {
         //console.log(e);
        event.res.statusCode = 404;
        event.res.end('Not found');
    }

})
