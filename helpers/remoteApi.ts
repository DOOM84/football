import moment from "moment";
import type {IChamp, IPlayer, IResult, IScorer, ITeam} from "~/types/interfaces";

const runtimeConfig = useRuntimeConfig();
const season = 2023;

export async function addPlayerInfo(teamApiId: number, playerApiId: number): Promise<Partial<IPlayer> | undefined> {

    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/players?id=${playerApiId}&season=${season}&team=${teamApiId}`,
        {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    if (response[0]?.player) {

        return response[0]?.player;
    }
}

export async function addTeamSquad(teamApiId: number | string, teamId: number): Promise<Partial<IPlayer>[]> {

    const {response} = await $fetch<Record<string, any>>(`https://v3.football.api-sports.io/players/squads?team=${teamApiId}`, {
        headers: {
            'x-rapidapi-key': runtimeConfig.apiKey,
            'x-rapidapi-host': runtimeConfig.apiHost,
        },
    })

    if (!response[0].players || !response[0].players.length) return [];

    return response[0].players.map((player: Record<string, any>): Partial<IPlayer> => ({
        api_id: player.id,
        name: player.name,
        img: player.photo,
        team_id: teamId,
        position_id: player.position.toLowerCase() === 'goalkeeper' ? 1 :
            player.position.toLowerCase() === 'defender' ? 2 :
                player.position.toLowerCase() === 'midfielder' ? 3 : 4,
    }))
}

export async function addChampSquad(champApiId: number/*, teamId: number*/): Promise<Partial<IPlayer>[]> {
    const squad = [];
    const data = await $fetch<Record<string, any>>(`https://v3.football.api-sports.io/players?league=${champApiId}&season=${season}`,
        {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    for (let i = 1; i < +data.paging.total + 1; i++) {

        if (i > 0 && i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 20000 * 3));
        }
        const data = await $fetch<Record<string, any>>(`https://v3.football.api-sports.io/players?league=${champApiId}&season=${season}&page=${i}`,
            {
                headers: {
                    'x-rapidapi-key': runtimeConfig.apiKey,
                    'x-rapidapi-host': runtimeConfig.apiHost,
                },
            })
        squad.push(...data.response);
    }

    return squad;
}

export async function addChampsStands(champs: any[]): Promise<Partial<ITeam>[]> {

    const teams = [];

    for (let j = 0; j < champs.length; j++) {

        const {response} = await $fetch<Record<string, any>>(
            `https://v3.football.api-sports.io/standings?league=${champs[j].api_id}&season=${season}`, {
                headers: {
                    'x-rapidapi-key': runtimeConfig.apiKey,
                    'x-rapidapi-host': runtimeConfig.apiHost,
                },
            })

        for (let i = 0; i < champs[j].teams.length; i++) {

            if (response[0]) {
                const teamToAdd = response[0].league.standings[0].filter((api_team: {
                    team: { id: string | number; };
                }) => +api_team.team.id === +champs[j].teams[i].api_id)[0];

                if (teamToAdd) {
                    champs[j].teams[i].games = teamToAdd.all.played;
                    champs[j].teams[i].win = teamToAdd.all.win;
                    champs[j].teams[i].draw = teamToAdd.all.draw;
                    champs[j].teams[i].lost = teamToAdd.all.lose;
                    champs[j].teams[i].goals = teamToAdd.all.goals.for;
                    champs[j].teams[i].missed = teamToAdd.all.goals.against;
                    champs[j].teams[i].diff = teamToAdd.goalsDiff;
                    champs[j].teams[i].points = teamToAdd.points;
                    champs[j].teams[i].order = teamToAdd.rank;
                }
            }


            teams.push({...champs[j].teams[i]})

        }

    }

    return teams;
}

export async function addChampResults(champId: string | number, champApiId: string | number): Promise<Partial<IResult>[]> {

    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/fixtures?league=${champApiId}&season=${season}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    return response.map((match: {
        league: { round: string; };
        fixture: { timestamp: number; id: number };
        goals: { home: any; away: any; };
        teams: { home: { id: string | number; }; away: { id: string | number; }; };
    }) => {

        return {
            tour: +match.league.round.split(" ")[3],
            date: moment(match.fixture.timestamp * 1000).startOf('day').valueOf(),
            res1: match.goals.home,
            res2: match.goals.away,
            team1: +match.teams.home.id,
            team2: +match.teams.away.id,
            time: null, //moment.utc(match.fixture.timestamp*1000).utcOffset(+2).format('HH:mm'),
            stamp: match.fixture.timestamp,
            api_id: match.fixture.id,
            champ_id: +champId
        }

    })
}

export async function addChampTourResults(champId: string | number, champApiId: string | number, tour: string | number): Promise<Partial<IResult>[]> {

    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/fixtures/?league=${champApiId}&season=${season}&round=Regular Season - ${tour}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    return response.map((match: {
        fixture: { timestamp: number; id: number };
        goals: { home: any; away: any; };
        teams: { home: { id: string | number; }; away: { id: string | number; }; };
    }) => {

        return {
            tour: +tour,//+match.league.round.split(" ")[3],
            date: moment(match.fixture.timestamp * 1000).startOf('day').valueOf(),
            res1: match.goals.home,
            res2: match.goals.away,
            team1: +match.teams.home.id,
            team2: +match.teams.away.id,
            time: null, //moment.utc(match.fixture.timestamp*1000).utcOffset(+2).format('HH:mm'),
            stamp: match.fixture.timestamp,
            api_id: match.fixture.id,
            champ_id: +champId
        }

    })
}

export async function addChampsScorers(champs: IChamp[]): Promise<Partial<IScorer>[]> {

    const players = []

    for (let i = 0; i < champs.length; i++) {
        const {response} = await $fetch<Record<string, any>>(
            `https://v3.football.api-sports.io/players/topscorers?league=${champs[i].api_id}&season=${season}`, {
                headers: {
                    'x-rapidapi-key': runtimeConfig.apiKey,
                    'x-rapidapi-host': runtimeConfig.apiHost,
                },
            })

        const scorers = [...response.slice(0, 10)];

        for (let j = 0; j < response.slice(0, 10).length; j++) {
            scorers[j] = {
                api_id: scorers[j].player.id,
                goals: +scorers[j].statistics[0].goals.total,
                name: scorers[j].player.name,
                champ_id: champs[i].id
            }
        }

        players.push([...scorers]);

    }

    return players.flat()
}

export async function addEcupResults(ecupApiId: string | number): Promise<Partial<IResult>[]> {

    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/fixtures?league=${ecupApiId}&season=${season}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    return response;
}

export async function addEcupStands(ecupApiId: string | number, ecup_teams: ITeam[], ecupId: string | number): Promise<any> {

    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/standings?league=${ecupApiId}&season=${season}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    if (!response[0]?.league?.standings) return []


    const groups = response[0].league.standings.map((ecupGroupTeams: any[]) => {

        return ecupGroupTeams.map((team) => {


            const ind = ecup_teams.findIndex((ecupTeam) => {
                return +ecupTeam.api_id! === +team.team.id
            })

            team.team_id = ecup_teams[ind].id;

            return {
                games: team.all.played,
                win: team.all.win,
                draw: team.all.draw,
                lost: team.all.lose,
                goals: team.all.goals.for,
                missed: team.all.goals.against,
                diff: team.goalsDiff,
                points: team.points,
                order: team.rank,
                group: team.group.split(" ")[1],
                team_id: team.team_id,
                ecup_id: +ecupId,
            }
        });

    })

    return groups.flat();
}

export async function matchInfo(matchApiId: number | string): Promise<Record<string, any>[]> {
    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${matchApiId}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    return response;
}

export async function matchSquads(matchApiId: number | string): Promise<Record<string, any>[]> {
    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchApiId}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    return response.map((info: Record<string, any>) => ({
        team: info.team, formation: info.formation, squads: info.startXI, substitutes: info.substitutes
    }));
}

export async function liveScores(leagues: string): Promise<Record<string, any>[]> {
    const {response} = await $fetch<Record<string, any>>(
        `https://v3.football.api-sports.io/fixtures?live=${leagues}`, {
            headers: {
                'x-rapidapi-key': runtimeConfig.apiKey,
                'x-rapidapi-host': runtimeConfig.apiHost,
            },
        })

    return response.map((match: {events: any[], goals: { home: any; away: any; }; fixture: { id: any; timestamp: any}; }) => {

            return {
                res1: +match.goals.home,
                res2: +match.goals.away,
                api_id: +match.fixture.id,
                stamp: +match.fixture.timestamp,
                events: match.events,
                date: +moment(match.fixture.timestamp * 1000).startOf('day').valueOf(),
            }
        }
    )
}


//moment(str, 'DD MMM YYYY').unix()