import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {slug} = useQuery(event);

        let comments =  (await db.collection('comments').doc(slug).get()).data()?.comments || [];

        if(comments.length){

            comments = await Promise.all(comments.map(async (comment)=>{
                comment.user.avatar = (await db.collection('users').doc(comment.user.id).get())
                    .data().avatar;
                return comment
            }))

            comments.sort((a, b) => {
                return a.createdAt - b.createdAt;
            });

        }

        return comments;

    }catch (e) {
         //console.log(e);
    }

})
