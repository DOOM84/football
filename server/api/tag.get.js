import {getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        const {slug} = useQuery(event);

        const tag = (await db.collection('tags').doc(slug).get()).data();

        if (!tag) {

            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const postSlugs = (await db.collection('tag_posts').doc(slug).get()).data().posts;

        if (!postSlugs || !postSlugs.length) {
            return {
                tag,
                posts: []
            }
        }


        const posts = await Promise.all(postSlugs.map(async (slug) => {
                const post = (await db.collection('posts')
                    .doc(slug).get()).data();
                return {
                    champ: post.champ,
                    champ_name: post.champ_name,
                    date: post.date,
                    ecup: post.ecup,
                    ecup_name: post.ecup_name,
                    images: post.images,
                    slug: post.slug,
                    title: post.title,
                }
            })
        )

        return {
            tag,
            posts: posts.slice(0, 28)
        }

    } catch (e) {
       // console.log(e);
    }

})
