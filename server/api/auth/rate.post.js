import { getFirestore} from 'firebase-admin/firestore';
import admin from 'firebase-admin';

const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        const {id, rating} = await useBody(event);

        const {token} = useCookies(event);

        const {uid} = await admin.auth().verifyIdToken(token);

        const postRate = (await db.collection('ratings').doc(id).get()).data();

        let finalRate;

        if(!postRate){
            await db.collection('ratings').doc(id).set(
                {
                    rates: [{user: uid, rate: +rating}],
                    rating: +rating
                })

            await db.collection('posts').doc(id).update({userRate: +rating});

            finalRate = rating;

        }else{

            const ind = postRate.rates.findIndex(r => r.user === uid);

            if(ind > -1){
                postRate.rates[ind].rate = rating;
            }else{
                postRate.rates.push({user: uid, rate: rating})
            }

            const ratesSum = postRate.rates.reduce((n, {rate}) => n + Number(rate), 0);

            finalRate = (ratesSum / postRate.rates.length).toFixed(1);


            await db.collection('ratings').doc(id).update({rates: postRate.rates, rating: +finalRate});

            await db.collection('posts').doc(id).update({userRate: +finalRate})

        }

        return {
            rate: +finalRate
        }



    }catch (e) {
        event.res.statusCode = 403;
        event.res.end('Access denied');
    }

})