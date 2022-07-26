import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        const champsSnap = await db.collection('compets').orderBy('name', 'asc').get();

        const countries = champsSnap.docs.map(champ => champ.data().slug)

        return  await Promise.all(countries.map(async (champ) => {

            const res = (await db.collection('champs').doc(champ).get()).data();

            res.teams.sort((a,b)=> ((a.order - b.order) || (b.points - a.points)));

            return res
        }))

    }catch (e) {
         console.log(e);
    }

})
