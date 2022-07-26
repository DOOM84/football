import admin from "firebase-admin";
import { getFirestore} from 'firebase-admin/firestore';
const db = getFirestore();
import {useCookie} from "h3";
import * as yup from 'yup';


const schema = yup.object({

    comment: yup.string('Содержимое Вашего сообщения менее 10 или более 2000 знаков')
        .required('Введите текст, либо отформатируйте его без лишних переносов строк')
        .trim('Введите текст, либо отформатируйте его без лишних переносов строк')
        .test(
            'line_breaks',
            'Введите текст, либо отформатируйте его без лишних переносов строк',
            (value) => value.indexOf('\n\n\n') < 0
        ).max(8000, 'Содержимое Вашего комментария больше 8000 знаков'),
});

export default defineEventHandler(async (event) => {

    try {

        const token = useCookie(event.req, 'token')

        const {uid} = await admin.auth().verifyIdToken(token);
        const user = await admin.auth().getUser(uid);

        const {slug, comment, quote}  = await useBody(event);

        await schema.validate({
            comment
        });

        const id = db.collection('comments').doc().id;

        const newComment = {

            body: comment,
            createdAt: Date.now(),
            id,
            post: slug,

            user: {
                name: user.displayName,
                avatar: user.photoURL.substring(user.photoURL.indexOf('/img')),
                id: uid
            },

            quote: quote ? JSON.parse(quote) : null
        }

        let commentsSnap = await db.collection('comments').doc(slug).get();

        if(commentsSnap.exists){

            const comments = commentsSnap.data().comments;

            comments.push(newComment);

            await db.collection('comments').doc(slug).update(
                {comments: comments}
            )

        }else{
            await db.collection('comments').doc(slug).set(
                {comments: [newComment]}
            )
        }

        return {
            newComment
        };

    } catch (e) {

        if (e.path) {

            event.res.statusCode = 422;
            event.res.end(JSON.stringify({
                msg: e.errors[0]
            }));
        } else {

            event.res.statusCode = 401;
            event.res.end(JSON.stringify({
                msg: 'Unauthenticated'
            }));
        }
    }

})
