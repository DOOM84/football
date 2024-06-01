import groupBy from "~/helpers/groupBy";

export default (match: Record<string, any>) => {

    const grouppedGoals = groupBy(match.info.filter((m: { type: string; detail: string; }) => m.type.toLowerCase() === 'goal' && m.detail.toLowerCase() !== 'missed penalty')
        .map((m: { teamId: any; team: { id: any; }; }) => {
            m.teamId = m.team.id;
            return m;
        }
    ), 'teamId') as Record<string, any>;

    const grouppedCards = groupBy(match.info.filter((m: { type: string; }) => m.type.toLowerCase() === 'card').map((m: { teamId: any; team: { id: any; }; }) => {
            m.teamId = m.team.id;
            return m;
        }
    ), 'teamId') as Record<string, any>;

    /*const cards = {home: {cards: 0, teamId: null}, away: {cards: 0, teamId: null}} as Record<string, any>

    for (const [key, value] of Object.entries(grouppedCards)) {
        if (match.ecupResult) {
            if (+key === +match.ecupResult.home.api_id) {
                cards.home.cards = grouppedCards[key].length;
                cards.home.teamId = +match.ecupResult.home.api_id;
            } else {
                cards.away.cards = grouppedCards[key].length;
                cards.away.teamId = +match.ecupResult.away.api_id;
            }
        } else if (match.champResult) {
            if (+key === +match.champResult.home.api_id) {
                cards.home.cards = grouppedCards[key].length;
                cards.home.teamId = +match.champResult.home.api_id;
            } else {
                cards.away.cards = grouppedCards[key].length
                cards.away.teamId = +match.champResult.away.api_id;
            }
        }
    }

    const goals = {home: {score: 0, teamId: null}, away: {score: 0, teamId: null}} as Record<string, any>

    for (const [key, value] of Object.entries(grouppedGoals)) {
        if (match.ecupResult) {
            if (+key === +match.ecupResult.home.api_id) {
                goals.home.score = grouppedGoals[key].length;
                goals.home.teamId = +match.ecupResult.home.api_id;
            } else {
                goals.away.score = grouppedGoals[key].length;
                goals.away.teamId = +match.ecupResult.away.api_id;
            }
        } else if (match.champResult) {
            if (+key === +match.champResult.home.api_id) {
                goals.home.score = grouppedGoals[key].length;
                goals.home.teamId = +match.champResult.home.api_id;
            } else {
                goals.away.score = grouppedGoals[key].length
                goals.away.teamId = +match.champResult.away.api_id;
            }
        }
    }*/

    match.lineups.map((lineup: { squads: any[]; }) => {
        if(!lineup.squads || !Array.isArray(lineup.squads)){
            lineup.squads = []
        }
        lineup.squads.map(squad => {
            squad.player.subst = match.info.filter((event: { type: string; assist: { id: any; }; }) => event.type.toLowerCase() === 'subst'
            && squad.player.id === event.assist.id)[0];
            squad.player.subst = squad.player.subst ? squad.player.subst.time : null
            return squad
        })
        return lineup
    })

    match.lineups.map((lineup: { substitutes: any[]; }) => {
        if(!lineup.substitutes || !Array.isArray(lineup.substitutes)){
            lineup.substitutes = []
        }
        lineup.substitutes.map(squad => {
            squad.player.subst = match.info.filter((event: { type: string; player: { id: any; }; }) => event.type.toLowerCase() === 'subst'
            && squad.player.id === event.player.id)[0];
            squad.player.subst = squad.player.subst ? squad.player.subst.time : null
            return squad
        })
        return lineup
    })
    
    match.homeSquad = getSquad(match.lineups[0], true);
    match.awaySquad = getSquad(match.lineups[1], false);




    return {
        grouppedGoals,
        grouppedCards,
       // cards,
       // goals,
    }

}


function getSquad(mLineups: Record<string, any>, home: boolean): any[]{
    if(!mLineups?.squads){
        return []
    }
    const allSquad = (mLineups.squads as any[]).map(p  => p.player).filter(p => p.pos && p.grid) as any[];
    allSquad.map(sq => {
        sq.line = parseInt(sq.grid.substring(0, 1));
        sq.place = parseInt(sq.grid.charAt(sq.grid.length-1));
        delete sq.grid;
        return sq;
    }).sort((a, b) => a.place - b.place);

    const groupped =  groupBy(allSquad, 'line') as Record<string, any[]>;

    if(home){
        return Object.keys(groupped).map(line => {
            return groupped[line].reverse();
        })  
    }

    return Object.keys(groupped).reverse().map(line => {
        return groupped[line];
    })

}
