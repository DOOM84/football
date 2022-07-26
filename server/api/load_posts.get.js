import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {ecup, champ, tag, offset, limit} = useQuery(event);

        let postsSnap;
        if(tag){
            const postSlugs = (await db.collection('tag_posts').doc(tag).get()).data().posts;

            postSlugs.splice(0, +offset).slice(0, +limit);

            return  await Promise.all(postSlugs.map(async (slug) => {
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
        }
        else if(champ){
            postsSnap = await db.collection('posts').orderBy('date', 'desc')
                .where('champ', '==', champ).where('status', '==', true)
                .limit(+limit).offset(+offset).get();
        }else if(ecup){
            postsSnap = await db.collection('posts').orderBy('date', 'desc')
                .where('ecup', '==', ecup).where('status', '==', true)
                .limit(+limit).offset(+offset).get();
        }else{
            postsSnap = await db.collection('posts').orderBy('date', 'desc')
                .where('status', '==', true)
                .limit(+limit).offset(+offset).get();
        }

        return postsSnap.docs.map((doc) => {

            return {
                champ: doc.data().champ,
                champ_name: doc.data().champ_name,
                date: doc.data().date,
                ecup: doc.data().ecup,
                ecup_name: doc.data().ecup_name,
                images: doc.data().images,
                slug: doc.data().slug,
                title: doc.data().title,
            }

        })

    }catch (e) {
         console.log(e);
    }

})
