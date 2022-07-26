import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {
        const allPlayersSnap = await db.collection('players').get();

        const res = [];

        const players = allPlayersSnap.docs.map((item)=>{
           return {slug: item.id, id: item.data().id}
        })

        players.map(player => {

            const ind = players.findIndex((plr)=>{
                return player.slug !== plr.slug && player.id === plr.id
            })

            if(ind > -1){
               // players[ind].slug1 = player.slug;
                res.push(players[ind]);
            }


        })

        return res;


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
