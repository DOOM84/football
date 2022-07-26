import { getFirestore} from 'firebase-admin/firestore';
const db = getFirestore();

export default defineEventHandler(async (event) => {

    try {

        const {id, slug} = await useBody(event);

        let comments =  (await db.collection('comments').doc(slug).get()).data()?.comments || [];

        const ind = comments.findIndex(comment => comment.id === id);

        if(ind > -1 ){
            comments.splice(ind, 1);

            await db.collection('comments').doc(slug).update(
                {comments: comments}
            )
        }

        return {
            toDel: id,
        };

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));

    }

})
