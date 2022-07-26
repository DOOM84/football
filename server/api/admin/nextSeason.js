import { getFirestore} from 'firebase-admin/firestore';
const db = getFirestore();

export default defineEventHandler(async (event) => {
    try {

        let season = (await db.collection('globals').doc('season').get()).data().year;

        if(!season) season = new Date().getFullYear();

        let archiveSeasons = (await db.collection('globals')
            .doc('archive').get()).data().seasons;

        if(!archiveSeasons) archiveSeasons = [];

        archiveSeasons.push(+season);

        await db.collection('globals').doc('archive').update({seasons: archiveSeasons});

        const champsSnap = await db.collection('champs').get();
        const resultsSnap = await db.collection('results').get();
        const ecupStandsSnap = await db.collection('ecup_stands').get();
        const ecupResultsSnap = await db.collection('ecup_results').get();



        await Promise.all(champsSnap.docs.map(async (champ) => {

            await db.collection('champs' + season).doc(champ.id).set(
                {
                ...champ.data(),
                teams: champ.data().teams.filter(team => team.status)
            })

            const teams = champ.data().teams.map(team =>({
                ...team,
                games : 0,
                win : 0,
                draw : 0,
                lost : 0,
                goals : 0,
                missed : 0,
                diff : 0,
                points : 0,
            }))

            await db.collection('champs').doc(champ.id).update({teams})
        }))


        await Promise.all(resultsSnap.docs.map(async (champ) => {

            await db.collection('results' + season).doc(champ.id).set(
                {
                    ...champ.data(),
                })

            await db.collection('results').doc(champ.id).update({results: {}})
        }))


        await Promise.all(ecupStandsSnap.docs.map(async (ecup) => {

            await db.collection('ecup_stands' + season).doc(ecup.id).set(
                {
                    ...ecup.data(),
                })

            await db.collection('ecup_stands').doc(ecup.id).update({stands: {}})
        }))


        await Promise.all(ecupResultsSnap.docs.map(async (ecup) => {

            await db.collection('ecup_results' + season).doc(ecup.id).set(
                {
                    ...ecup.data(),
                })

            await db.collection('ecup_results').doc(ecup.id).update({group: {}, playOff: {}});
        }))

        await db.collection('globals').doc('season').update({year: +season+1});

        return {}


        }catch (e) {

         //console.log(e);

    }

})

