import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
const db = getFirestore();

const schema = yup.object().shape(
    {
        added: yup.object().shape({
            name: yup.string('Название должно быть строкой')
                .trim('Введите название').required('Введите название'),
            api_id: yup.string('Введите api id').ensure('Введите api_id')
                .trim('Введите api id').required('Введите api id'),
            sprite: yup.string()
                .trim('Укажите координаты иконки в спрайте').required('Укажите координаты иконки в спрайте')
        })
    }
)


export default defineEventHandler(async (event) => {

        const added = await useBody(event);

    try {

            await schema.validate({
                added,
            });


        const ecupTeams = (await db.collection('ecup_teams')
            .doc('teams').get()).data().teams;

        const ind = ecupTeams.findIndex(item => +item.api_id === +added.api_id);

        if(ind > -1){
            ecupTeams[ind] = added;
        }

        await db.collection('ecup_teams').doc('teams').update({teams: ecupTeams});

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