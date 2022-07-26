import { getFirestore} from 'firebase-admin/firestore';
//import slugify from "slugify";
const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {playerId, count} = useQuery(event);

        const player = (await db.collection('players').doc(playerId).get()).data();

        if (!player) {
            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const posts = await $fetch('/api/player_posts',{params: {player: playerId, count}});

        return {
            player,
            posts
        }


    }catch (e) {
        // console.log(e);
    }

})
