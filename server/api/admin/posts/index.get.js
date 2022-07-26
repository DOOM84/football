import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {
        const teams = [];

        const champsTeamsSnap = await db.collection('champs').get();
        const tagsSnap = await db.collection('tags').get();
        const champsSnap = await db.collection('compets').get();
        const ecupsSnap = await db.collection('ecups').get();
        const postsSnap = await db.collection('posts').get();

        champsTeamsSnap.docs.map((doc) => {
            const filteredTeams = doc.data().teams.map((team)=>{
                return {
                    name: team.name,
                    slug: team.slug,
                }
            })
            teams.push(...filteredTeams)
        });


        const posts = postsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const tags = tagsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const champs = champsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const ecups = ecupsSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        /*const players = playersSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const players = playersSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });
        const players = playersSnap.docs.map((doc) => {
            return {...doc.data(), id: doc.id}
        });*/

       return {
           posts: posts.sort((a, b) => b.date - a.date),
           tags,
           teams: teams.sort( (a, b) => a.name.localeCompare(b.name)),
           champs,
           ecups

          // players
       }

    } catch (e) {

        event.res.statusCode = 404;
        event.res.end('Error occurred. Try again later...');
        /*res.writeHead(401, {
            "Set-Cookie": `token=; HttpOnly; path=/; max-age=0`,
        });
        //res.statusCode = 401;
        res.end(JSON.stringify({msg: 'no or expired token'}));*/
    }

})
