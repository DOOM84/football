import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {slug} = useQuery(event);

        const postSnap = await db.collection('posts').doc(slug).get();

        if (!postSnap.exists || !postSnap.data().status) {

            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const post =  postSnap.data();

        if(post.tags && post.tags.length){
            post.tags = await Promise.all(post.tags.map(async (tag) => {
                    return (await db.collection('tags')
                        .doc(tag).get()).data()
                })
            )
        }

        if(post.players && post.players.length){
            post.players = await Promise.all(post.players.map(async (player) => {

                const postPlayer = (await db.collection('players')
                        .doc(player).get())

                return {
                    slug: postPlayer.exists ? postPlayer.id : player,
                    name: postPlayer.exists ? postPlayer.data().name : player,
                }
                })
            )
        }

        const comments = await $fetch('/api/comments', {params: {slug}})

         return {
             post,
             comments,
         }

    }catch (e) {
        event.res.statusCode = 404;
        event.res.end('Not found');
        //throw new Error('manually triggered error');
    }

})
