import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {team, count} = useQuery(event);

        const teamPosts = (await db.collection('team_posts').doc(team).get()).data();

        if(!teamPosts){
            return []
        }

        const posts = await Promise.all(teamPosts.posts.map(async (post) => {

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
