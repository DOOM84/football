import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        const champsSnap = await db.collection('compets').orderBy('name', 'asc').get();

       const countries = champsSnap.docs.map(champ => champ.data().slug)

        return  await Promise.all(countries.map(async (champ) => {

            return await $fetch('/api/tour', {params: {champ}})

        }))

    }catch (e) {
         console.log(e);
    }

})
