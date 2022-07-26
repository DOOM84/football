import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
import slugify from "slugify";
const db = getFirestore();

const schema = yup.object().shape(
    {
        added: yup.object().shape({
            name: yup.string('Название должно быть строкой')
                .trim('Введите название').required('Введите название'),
            all_tours: yup.string('Введите количество туров чемпионата')
                .trim('Введите количество туров чемпионата').required('Введите количество туров чемпионата'),
            api_id: yup.string('Введите api id')
                .trim('Введите api id').required('Введите api id'),
            current_tour: yup.string()
                .trim('Введите текущий тур чемпионата').required('Введите текущий тур чемпионата')
        })
    }
)


export default defineEventHandler(async (event) => {

    const added = await useBody(event);

    try {

        await schema.validate({
            added,
        });

        added.slug = slugify(added.name, {strict: true, lower:true});

        await db.collection('compets').doc(added.slug).set(added);

        return {result: added};

    } catch (e) {

        if (e.path) {
            event.res.statusCode = 422;
            event.res.end(JSON.stringify({
                msg: e.errors[0]
            }));

        } else {

            event.res.setHeader('Content-Type', 'application/json');
            event.res.statusCode = 401;
            event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));

        }
    }

})