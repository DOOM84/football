import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        let {champ} = useQuery(event);

        return (await db.collection('tour').doc(champ).get()).data();

    }catch (e) {
         console.log(e);
    }

})
