import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import * as yup from 'yup';

const schema = yup.object({
    credentials: yup.object({
        email: yup.string('Введен некорректный Email адрес').trim('Введен некорректный Email адрес')
            .email('Введен некорректный Email адрес').required('Введен некорректный Email адрес'),
    }),
});

export default defineEventHandler(async (event) => {

    const credentials = await useBody(event);

    const auth = getAuth();

    try {

        await schema.validate({
            credentials,
        });

        await sendPasswordResetEmail(auth, credentials.email);

        return {msg: 'success'};

    } catch (e) {

        if (e.path) {
            event.res.statusCode = 422;
            event.res.end(JSON.stringify({
                msg: e.errors[0]
            }));
        } else {
            event.res.statusCode = 403;
            event.res.end(e.code);
        }
    }

})
