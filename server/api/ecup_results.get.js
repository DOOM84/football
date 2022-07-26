import { getFirestore} from 'firebase-admin/firestore';
import sortObj from "~/helpers/sortObj";

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        let {ecup} = useQuery(event);

        const ecupSnap = await db.collection('ecups').doc(ecup).get();

        if (!ecupSnap.exists) {

            const e = new Error('Not found');

            e.code = '404';
            e.statusCode = 404;

            await Promise.reject(e);
        }

        const sources = (await db.collection('ecup_results').doc(ecup).get()).data();

        sources.group = Object.keys(sources.group).length > 0 ? sortObj(sources.group) : {};

        Object.keys(sources.playOff).length > 0 ? sources.playOff.sort((a,b)=> (a.order - b.order)) : {}

            return sources

    }catch (e) {
        // console.log(e);
    }

})



