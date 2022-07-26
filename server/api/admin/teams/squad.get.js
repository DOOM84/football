import { getFirestore} from 'firebase-admin/firestore';

const db = getFirestore();


export default defineEventHandler(async (event) => {

    try {

        let {team} = useQuery(event);

        const champsSnap = await db.collection('squads').doc(team).get();

        if(!champsSnap.exists){return []}

        return champsSnap.data().players.map((player)=>{
            return {...player, team}
        }).sort((a,b)=> (a.position_id - b.position_id));

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
