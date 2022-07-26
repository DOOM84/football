import { getFirestore} from 'firebase-admin/firestore';
import slugify from "slugify";
import groupBy from "~/helpers/groupBy";
import moment from 'moment/min/moment-with-locales.js';
import algoliasearch from "algoliasearch";
import sortObj from "~/helpers/sortObj";
moment.locale('ru');
const runtimeConfig = useRuntimeConfig();

const db = getFirestore();

export async function addPlayerInfo(teamApiId, teamSlug, playerId) {


    const teamPlayers = (await db.collection('squads').doc(teamSlug).get()).data();

    const player = teamPlayers.players.filter(player=> +player.id === +playerId)[0];

    if(player){
        const {response} = await $fetch(
            'https://v3.football.api-sports.io/players?id='+player.id+'&season=2022&team='+teamApiId,
            {
                headers: {
                    'x-rapidapi-key': runtimeConfig.apiKey,
                    'x-rapidapi-host': runtimeConfig.apiHost,
                },
            })

        if(response[0]?.player){

            const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
            const index = client.initIndex('players');

            let state;

            if(response[0].player.nationality){
                state = (await db.collection('countries')
                    .doc(slugify(response[0].player.nationality, {strict: true, lower: true}))
                    .get()).data();
            }
            const stateToAdd = state?.name || response[0].player.nationality;

            const playerToDb = {...response[0].player, country: stateToAdd,
                team: teamSlug, position_id: player.position_id, number: player.number};

            delete playerToDb.injured;

            await db.collection('players').doc(player.slug).set(
                playerToDb
            )

            await index.saveObject({
                objectID: player.slug,
                ...playerToDb
            });
        }
    }
}


async function getPlayerSlug(playerSlug, playerId, flag){

    const newPlayerSlug = playerSlug+'-'+flag;

    const existingPlayer = await db.collection('players').doc(newPlayerSlug).get();

    if(existingPlayer.exists && +existingPlayer.data().id !== +playerId){
        flag += 1;
       return await getPlayerSlug(playerSlug, playerId, flag)
    }
    return newPlayerSlug;
}


export async function addTeamSquad(teamApiId, teamSlug) {
    const {response} = await $fetch('https://v3.football.api-sports.io/players/squads?team='+teamApiId, {
        headers: {
            'x-rapidapi-key': runtimeConfig.apiKey,
            'x-rapidapi-host': runtimeConfig.apiHost,
        },
    })

    if(!response[0].players || !response[0].players.length) return [];

    const players = (await db.collection('squads').doc(teamSlug).get()).data().players;

    let playersToDb = [];

    if(players && players.length){

        playersToDb = [...players];

        await Promise.all(response[0].players.map(async (player)=>{

            const ind = playersToDb.findIndex(pl => +pl.id === +player.id);

            if(ind < 0){
                let playerSlug = slugify(player.name, {strict: true, lower: true});

                const existingPlayer = await db.collection('players').doc(playerSlug).get();

                if(existingPlayer.exists && +existingPlayer.data().id !== +player.id){

                    playerSlug = await getPlayerSlug(playerSlug, player.id, 1);

                }

                playersToDb.push({
                    ...player,
                    slug: playerSlug,
                    position_id: player.position.toLowerCase() === 'goalkeeper' ? 1 :
                        player.position.toLowerCase() === 'defender' ? 2 :
                            player.position.toLowerCase() === 'midfielder' ? 3 : 4
                })

                for (let i = 0; i < playersToDb.length; i++) {
                    const ind = response[0].players.findIndex(pl => +pl.id === +playersToDb[i].id);
                    if(ind < 0){playersToDb.splice(i, 1)}
                }
            }
        }))

    }else{
        playersToDb = await Promise.all(response[0].players.map(async (player)=>{

                let playerSlug = slugify(player.name, {strict: true, lower: true});

                const existingPlayer = await db.collection('players').doc(playerSlug).get();

                if(existingPlayer.exists && +existingPlayer.data().id !== +player.id){

                    playerSlug = await getPlayerSlug(playerSlug, player.id, 1);

                }

                return {
                    ...player,
                    slug: playerSlug,
                    position_id: player.position.toLowerCase() === 'goalkeeper' ? 1 :
                        player.position.toLowerCase() === 'defender' ? 2 :
                            player.position.toLowerCase() === 'midfielder' ? 3 : 4
                }
            })
        )
    }

    await db.collection('squads').doc(teamSlug).set(
        {players: playersToDb}
    )

    return playersToDb.map(player => ({...player, team: teamSlug}))
        .sort((a,b)=> (a.position_id - b.position_id));
}


export async function addChampsStands() {
    const champsSnap =  await db.collection('champs').get();

    champsSnap.docs.map(async (country)=>{

        const {response} = await $fetch(
            'https://v3.football.api-sports.io/standings?league='+country.data().champ.api_id+'&season=2022', {
                headers: {
                    'x-rapidapi-key': runtimeConfig.apiKey,
                    'x-rapidapi-host': runtimeConfig.apiHost,
                },
            })


        const champ = {...country.data()};

        champ.teams = champ.teams.map((team)=>{

            if(response[0]){
                const teamToAdd = response[0].league.standings[0].filter((api_team)=>+api_team.team.id === +team.api_id)[0];

                if(teamToAdd){
                    team.games = teamToAdd.all.played;
                    team.win = teamToAdd.all.win;
                    team.draw = teamToAdd.all.draw;
                    team.lost = teamToAdd.all.lose;
                    team.goals = teamToAdd.all.goals.for;
                    team.missed = teamToAdd.all.goals.against;
                    team.diff = teamToAdd.goalsDiff;
                    team.points = teamToAdd.points;
                    team.order = teamToAdd.rank;
                }
            }

            return team

        })

        await db.collection('champs').doc(country.id).update({teams: champ.teams})

    })
}


export async function addChampResults(champSlug, champApiId) {

    const champ =  (await db.collection('champs').doc(champSlug).get()).data();


    const {response} = await $fetch(
        'https://v3.football.api-sports.io/fixtures?league='+champApiId+'&season=2022', {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    const champResults = response.map((match)=>{

        const indHome = champ.teams.findIndex(team => +team.api_id === +match.teams.home.id);
        const indAway = champ.teams.findIndex(team => +team.api_id === +match.teams.away.id);

        let team1;
        let team2;

        if(indHome > -1 && indAway > -1){
            team1 = {
                name: champ.teams[indHome].name,
                parse_id: champ.teams[indHome].api_id,
                slug: champ.teams[indHome].slug,
                sprite: champ.teams[indHome].sprite,
            }
            team2 = {
                name: champ.teams[indAway].name,
                parse_id: champ.teams[indAway].api_id,
                slug: champ.teams[indAway].slug,
                sprite: champ.teams[indAway].sprite,
            }

        }else{
            team1 = {parse_id: match.teams.home.id, name: match.teams.home.name}
            team2 = {parse_id: match.teams.away.id, name: match.teams.away.name}
        }


        return {
            tour: +match.league.round.split(" ")[3],
            date: moment(match.fixture.timestamp*1000).startOf('day').valueOf(),
            //date: moment(match.fixture.timestamp*1000).format('DD-MM-YYYY'),
            res1: match.score.fulltime.home,
            res2: match.score.fulltime.away,
            team1,
            team2,
            time: moment(match.fixture.timestamp*1000).format('HH:mm'),
            stamp: match.fixture.timestamp
        }

    })


    const chResGrouped = groupBy(champResults, 'tour');

    Object.keys(chResGrouped).map((tour)=>{

        if(tour === 'NaN'){
            delete chResGrouped[tour]
        }else{

            chResGrouped[tour].sort((a,b)=> (a.stamp - b.stamp))

            chResGrouped[tour] = groupBy(chResGrouped[tour], 'date');
        }


    })

    //return chResGrouped;

    await db.collection('results').doc(champSlug).update({results: {...chResGrouped}})
}


export async function addChampTourResults(champSlug, champApiId, tour) {

    const champ =  (await db.collection('champs').doc(champSlug).get()).data();


    const {response} = await $fetch(
        'https://v3.football.api-sports.io/fixtures/?league='+champApiId+'&season=2022&round=Regular Season - '+tour,
        {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    const champResults = response.map((match)=>{

        const indHome = champ.teams.findIndex(team => +team.api_id === +match.teams.home.id);
        const indAway = champ.teams.findIndex(team => +team.api_id === +match.teams.away.id);

        let team1;
        let team2;

        if(indHome > -1 && indAway > -1){
            team1 = {
                name: champ.teams[indHome].name,
                slug: champ.teams[indHome].slug,
                sprite: champ.teams[indHome].sprite,
            }
            team2 = {
                name: champ.teams[indAway].name,
                slug: champ.teams[indAway].slug,
                sprite: champ.teams[indAway].sprite,
            }

        }else{
            team1 = {parse_id: match.teams.home.id, name: match.teams.home.name}
            team2 = {parse_id: match.teams.away.id, name: match.teams.away.name}
        }


        return {
            date: moment(match.fixture.timestamp*1000).startOf('day').valueOf(),
            res1: match.score.fulltime.home,
            res2: match.score.fulltime.away,
            team1,
            team2,
            time: moment(match.fixture.timestamp*1000).format('HH:mm'),
            stamp: match.fixture.timestamp
        }

    })

    champResults.sort((a,b)=> (a.stamp - b.stamp))

    const tourResGrouped = groupBy(champResults, 'date');

    await db.collection('tour').doc(champSlug).update({tour: {
            num: +tour,
            scores: tourResGrouped
        }})

    return {
        champ: champSlug,
        tour: {
            num: +tour,
            scores: tourResGrouped
        }
    }
}


export async function addChampsScorers() {
    const champsSnap = await db.collection('champs').get();

    for (let i = 0; i < champsSnap.docs.length; i++) {
        const {response} = await $fetch(
            'https://v3.football.api-sports.io/players/topscorers?league=' + champsSnap.docs[i].data().champ.api_id + '&season=2022', {
                headers: {
                    'x-rapidapi-key': runtimeConfig.apiKey,
                    'x-rapidapi-host': runtimeConfig.apiHost,
                },
            })
        const scorers = await Promise.all(response.slice(0, 10).map(async (scorer) => {

            const ind = champsSnap.docs[i].data().teams.findIndex((tm) => {
                return +tm.api_id === +scorer.statistics[0].team.id
            })

            let playerSlug = slugify(scorer.player.name, {strict: true, lower: true});

            if (ind > -1) {

                const squad = (await db.collection('squads')
                    .doc(champsSnap.docs[i].data().teams[ind].slug).get()).data()

                const playerInd = squad.players.findIndex((player) => {
                    return +player.id === +scorer.player.id
                })

                playerSlug = playerInd > -1 ? squad.players[playerInd].slug : playerSlug;
                    //slugify(scorer.player.name, {strict: true, lower: true});
            }

            return {
                goals: +scorer.statistics[0].goals.total,
                name: scorer.player.name,
                slug: playerSlug,
                team: {
                    name: champsSnap.docs[i].data().teams[ind]?.name || '',
                    slug: champsSnap.docs[i].data().teams[ind]?.slug || '',
                    sprite: champsSnap.docs[i].data().teams[ind]?.sprite || '',
                }
            }

        }))

        await db.collection('scorers').doc(champsSnap.docs[i].id).update({
            players: scorers})

    }
}


export async function addEcupStands(ecupApiId, ecupSlug) {

    const standings = {};

    const ecup_teams = (await db.collection('ecup_teams').doc('teams').get()).data().teams;

    const {response} = await $fetch(
        'https://v3.football.api-sports.io/standings?league='+ecupApiId+'&season=2022', {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })


    const groups =  response[0].league.standings.map((ecupGroupTeams)=>{

        const teams = ecupGroupTeams.map((team)=>{


            const ind = ecup_teams.findIndex((ecupTeam)=>{
                return +ecupTeam.api_id === +team.team.id
            })

            if(ind === -1){
                ecup_teams.push({
                    api_id: team.team.id,
                    name: team.team.name,
                })
            }else{
                team.team.name = ecup_teams[ind].name;
                team.slug = ecup_teams[ind].slug;
                team.sprite = ecup_teams[ind].sprite;
            }


            return {
                games : team.all.played,
                win : team.all.win,
                draw : team.all.draw,
                lost : team.all.lose,
                goals : team.all.goals.for,
                missed : team.all.goals.against,
                diff : team.goalsDiff,
                points : team.points,
                order : team.rank,
                group : team.group.split(" ")[1],
                name : team.team.name,
                api_id: team.team.id,
                slug: team.slug || null,
                sprite: team.sprite || null,
            }
        });

        return groupBy(teams, 'group')
    })

    groups.map((group, index)=>{
        Object.keys(group).map((gr)=>{
            if(!standings[gr]){
                standings[gr] = {}
            }
            standings[gr].teams = group[gr]
        })
    })

    await db.collection('ecup_stands').doc(ecupSlug).update({stands: standings})

}


export async function addEcupResults(ecupApiId, ecupSlug) {

    const ecup_teams = (await db.collection('ecup_teams').doc('teams').get()).data().teams;
    const ecup_stands = (await db.collection('ecup_stands').doc(ecupSlug).get()).data().stands;

    const {response} = await $fetch(
        ' https://v3.football.api-sports.io/fixtures?league='+ecupApiId+'&season=2022', {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    const ecupResults = response.map((match)=>{

        const indHome = ecup_teams.findIndex((ecupTeam)=>{
            return +ecupTeam.api_id === +match.teams.home.id
        });
        const indAway = ecup_teams.findIndex((ecupTeam)=>{
            return +ecupTeam.api_id === +match.teams.away.id
        })

        let team1;
        let team2;

        if(indHome > -1 && indAway > -1){
            team1 = {
                name : ecup_teams[indHome].name,
                slug : ecup_teams[indHome].slug || null,
                sprite : ecup_teams[indHome].sprite,
            }
            team2 = {
                name : ecup_teams[indAway].name,
                slug : ecup_teams[indAway].slug || null,
                sprite : ecup_teams[indAway].sprite,
            }

        }else{
            team1 = {id: match.teams.home.id, name: match.teams.home.name}
            team2 = {id: match.teams.away.id, name: match.teams.away.name}
        }

        let editedRound;

        if(match.league.round.toLowerCase().includes('group')){

            const groups = Object.keys(ecup_stands);

            for (let i = 0; i < groups.length; i++) {
                const ind = ecup_stands[groups[i]].teams.findIndex(team => +team.api_id === +match.teams.home.id);
                if(ind > -1){
                    const round = match.league.round.split(" ");
                    round[1] = ecup_stands[groups[i]].teams[ind].group;
                    editedRound = round.join(' ');
                    break;
                }
            }
        }


        return {
            round: editedRound || match.league.round,
            //date: moment(match.fixture.timestamp*1000).format('DD-MM-YYYY'),
            date: moment(match.fixture.timestamp*1000).startOf('day').valueOf(),
            res1: match.score.fulltime.home,
            res2: match.score.fulltime.away,
            team1,
            team2,
            time: moment(match.fixture.timestamp*1000).format('HH:mm'),
            stamp: match.fixture.timestamp
        }

    })

    const leResGrouped = groupBy(ecupResults, 'round');

    const allResults = {group: {}, playoff: []};

    Object.keys(leResGrouped).map((round)=>{

        let stage;

        if(round.toLowerCase().includes('group')){
            stage = round.split(" ")[1];

            if(!allResults.group[stage]){
                allResults.group[stage] = {}
            }
            leResGrouped[round] = leResGrouped[round].map((item)=>{
                delete item.round;
                return item;
            })

            leResGrouped[round].sort((a,b)=> (a.stamp - b.stamp));

            allResults.group[stage][round.slice(-1)] = groupBy(leResGrouped[round], 'date')
        }

        else if(round.toLowerCase().includes('knockout')){

            leResGrouped[round] = leResGrouped[round].map((item)=>{
                delete item.round;
                return item;
            })

            leResGrouped[round].sort((a,b)=> (a.stamp - b.stamp));

            const playOffStage = {
                order: 1,
                scores: groupBy(leResGrouped[round], 'date'),
                stage: '1/16 финала'
            }
            allResults.playoff.push(playOffStage)
        }

        else if(round.toLowerCase().includes('round of 16')){

            leResGrouped[round] = leResGrouped[round].map((item)=>{
                delete item.round;
                return item;
            })

            leResGrouped[round].sort((a,b)=> (a.stamp - b.stamp));

            const playOffStage = {
                order: 2,
                scores: groupBy(leResGrouped[round], 'date'),
                stage: '1/8 финала'
            }
            allResults.playoff.push(playOffStage)
        }

        else if(round.toLowerCase().includes('quarter-finals')){

            leResGrouped[round] = leResGrouped[round].map((item)=>{
               delete item.round;
                return item;
            })

            leResGrouped[round].sort((a,b)=> (a.stamp - b.stamp));

            const playOffStage = {
                order: 3,
                scores: groupBy(leResGrouped[round], 'date'),
                stage: '1/4 финала'
            }
            allResults.playoff.push(playOffStage)
        }

        else if(round.toLowerCase().includes('semi-finals')){

            leResGrouped[round] = leResGrouped[round].map((item)=>{
                delete item.round;
                return item;
            })

            leResGrouped[round].sort((a,b)=> (a.stamp - b.stamp));

            const playOffStage = {
                order: 4,
                scores: groupBy(leResGrouped[round], 'date'),
                stage: '1/2 финала'
            }
            allResults.playoff.push(playOffStage)
        }
        else if(round.toLowerCase() === 'final'){
            leResGrouped[round] = leResGrouped[round].map((item)=>{
                delete item.round;
                return item;
            })

            leResGrouped[round].sort((a,b)=> (a.stamp - b.stamp));

            const playOffStage = {
                order: 5,
                scores: groupBy(leResGrouped[round], 'date'),
                stage: 'Финал'
            }
            allResults.playoff.push(playOffStage)
        }

    })

    await db.collection('ecup_results').doc(ecupSlug).update({
        group: allResults.group,
        playOff: allResults.playoff,
    })

    return {
        ecup: ecupSlug,
        group: Object.keys(allResults.group).length > 0 ? sortObj(allResults.group) : {},
        playOff: allResults.playoff,
    }
}

//moment(str, 'DD MMM YYYY').unix()