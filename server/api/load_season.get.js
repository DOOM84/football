import {getFirestore} from 'firebase-admin/firestore';
import sortObj from "~/helpers/sortObj";

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {
        const {season, mode, champ, ecup} = useQuery(event);

        let res = {};

        if(mode === 'champStands'){

            res = (await db.collection('champs'+season).doc(champ).get()).data().teams;

            res.sort((a,b)=> ((a.order - b.order) || (b.points - a.points)));
        }

        if(mode === 'champResults'){

            res = (await db.collection('results'+season).doc(champ).get()).data().results;
        }

        if(mode === 'ecupStands'){

            let stands = (await db.collection('ecup_stands'+season).doc(ecup).get()).data().stands;

            Object.keys(stands).map(group => {
                stands[group].teams.sort((a,b)=> ((a.order - b.order) || (b.points - a.points)))

            })

            res = sortObj(stands)
        }

        if(mode === 'ecupResults'){
            const {group, playOff} = (await db.collection('ecup_results'+season).doc(ecup).get()).data();

            res.group = Object.keys(group).length > 0 ? sortObj(group) : {};

            res.playOff = Object.keys(playOff).length > 0 ? playOff.sort((a,b)=> (a.order - b.order)) : {}

        }

            return res


    } catch (e) {
       // console.log(e);
    }

})
