import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        let archiveSeasons = (await db.collection('globals')
            .doc('archive').get()).data().seasons;

        return archiveSeasons && archiveSeasons.length ? archiveSeasons : [];

    }catch (e) {
         console.log(e);
    }

})
