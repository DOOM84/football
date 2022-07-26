import {
    getFirestore
} from "firebase-admin/firestore";
const db = getFirestore();
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";



export default defineEventHandler(async (event) => {

    try {

        const {slug} = await useBody(event);

        const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
        const index = client.initIndex('players');

        await db.collection('players').doc(slug).delete();

        await index.deleteObject(slug);

        return {id: slug}

    } catch (e) {

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})