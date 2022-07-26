import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {player, count} = useQuery(event);

        const playerPosts = (await db.collection('player_posts').doc(player).get()).data();

        if(!playerPosts){
            return []
        }

        const posts = await Promise.all(playerPosts.posts.map(async (post) => {

            const postRes =  (await db.collection('posts').doc(post).get()).data();

            return {
                champ: postRes.champ,
                champ_name: postRes.champ_name,
                date: postRes.date,
                ecup: postRes.ecup,
                ecup_name: postRes.ecup_name,
                images: postRes.images,
                slug: postRes.slug,
                title: postRes.title,
            }
           }).slice(0, +count)
       )

        posts.sort((a,b)=> (b.date - a.date));

        return posts;

    }catch (e) {
         console.log(e);
    }

})
