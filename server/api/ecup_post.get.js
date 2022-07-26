import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {slug} = useQuery(event);

        const post =  (await db.collection('posts').doc(slug).get()).data();

        if(post.tags && post.tags.length){
            post.tags = await Promise.all(post.tags.map(async (tag) => {
                    return (await db.collection('tags')
                        .doc(tag).get()).data()
                })
            )
        }

        const comments = await $fetch('/api/comments', {params: {slug}});

         return {
             post,
             comments
         }

    }catch (e) {
         console.log(e);
    }

})
