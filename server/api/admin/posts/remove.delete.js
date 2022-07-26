import {
    getFirestore
} from "firebase-admin/firestore";
import setFilePath from "~/helpers/upload/setFilePath";
const db = getFirestore();
import fs from "fs";
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";


export default defineEventHandler(async (event) => {

    try {

        const id = await useBody(event);

        const {images, teams, players, tags} = (await db.collection('posts').doc(id).get()).data();

        const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
        const index = client.initIndex('posts');


        if(teams && teams.length){

            const teamsSnap = await db.collection('team_posts').get();

            await Promise.all(teamsSnap.docs.map(async (doc) => {
                const posts = doc.data().posts;
                const ind = posts.findIndex(post => post === id);
                if(ind > -1){
                    posts.splice(ind, 1);
                    await db.collection('team_posts').doc(doc.id).set({posts})
                }
            }))
        }

        if(players && players.length){

            const playersSnap = await db.collection('player_posts').get();

            await Promise.all(playersSnap.docs.map(async (doc) => {
                const posts = doc.data().posts;
                const ind = posts.findIndex(post => post === id);
                if(ind > -1){
                    posts.splice(ind, 1);
                    await db.collection('player_posts').doc(doc.id).set({posts})
                }
            }))
        }

        if(tags && tags.length){

            const tagsSnap = await db.collection('tag_posts').get();

            await Promise.all(tagsSnap.docs.map(async (doc) => {
                const posts = doc.data().posts;
                const ind = posts.findIndex(post => post === id);
                if(ind > -1){
                    posts.splice(ind, 1);
                    await db.collection('tag_posts').doc(doc.id).set({posts})
                }
            }))
        }

        await db.collection('posts').doc(id).delete();

        await index.deleteObject(id);

        if(images){
                if (fs.existsSync(setFilePath('/public' + images.original))) {
                    fs.unlinkSync(setFilePath('/public' + images.original));
                }
                if (fs.existsSync(setFilePath('/public' + images.thumbnail))) {
                    fs.unlinkSync(setFilePath('/public' + images.thumbnail));
                }
        }

        return {id}

    } catch (e) {

        console.log(e);

        event.res.statusCode = 401;
        event.res.end(JSON.stringify({
            msg: 'Unauthenticated'
        }));
    }

})