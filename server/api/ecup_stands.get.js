import { getFirestore} from 'firebase-admin/firestore';
import sortObj from "~/helpers/sortObj";

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        const ecupsSnap = await db.collection('ecups').orderBy('api_id', 'asc').get();

        const ecups = ecupsSnap.docs.map(ecup => ecup.data().slug);

        return  await Promise.all(ecups.map(async (ecup) => {

            const sources = (await db.collection('ecup_stands').doc(ecup).get()).data();

            Object.keys(sources.stands).map(group => {
                sources.stands[group].teams.sort((a,b)=> ((a.order - b.order) || (b.points - a.points)))

            })

            sources.stands = sortObj(sources.stands)

            return sources
        }))

    }catch (e) {
         console.log(e);
    }

})


