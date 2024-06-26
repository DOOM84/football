import type {User} from "@supabase/auth-js";

export interface IError extends Error {
    response?: {
        status: number;
        _data?: {
            msg: string;
            message: string;
        }
    }
    statusCode?: number;
    status?: number;
    message: string;
    statusMessage: string;
    code?: number | string;
    path?: string;
    errors?: string[];
}

export interface IUser extends User {
    id: string;
    user_id?: string;
    admin?: boolean;
    avatar?: string | null;
    email: string;
    login?: string;
    password?: string;
    passwordConfirmation?: string;
    banned_until?: string
}

export interface IChamp {
    id: number;
    api_id: number;
    name: string;
    slug: string;
    all_tours: number;
    current_tour: number;
    posts: IPost[];
    cups: ICup[];
    leagues: ILeague[];
    teams: ITeam[];
    scorers: IPlayer[];
    results?: IResult[];
    tour: IResult[];
    relegation: IResult[];
    delay: IResult[];
    status: boolean;
}

export interface ICup {
    id: number;
    api_id: number;
    name: string;
    slug: string;
    stage?: string;
    champ: Partial<IChamp>;
    champ_id: number | null;
    results: ICupResult[];
    status: boolean;
}

export interface ICupResult {
    id: number;
    date: number;
    res1: number;
    res2: number;
    cup: ICup;
    cup_id: number;
    home: ICupTeam;
    team1: number;
    team2: number;
    away: ICupTeam;
    stamp: number;
    api_id: number;
    is_info: boolean;
    time?: string;
    tour?: number;
    group?: string;
    stage?: string;
    order?: number;
    info: IMatchInfo;
    scores: {[index: number]: Partial<ICupResult>[]};
}

export interface ICupTeam {
    id: number;
    api_id: number | null;
    name: string;
    sprite: string | null;
    team: ITeam;
    results1: ICupResult[];
    results2: ICupResult[];
    team_id: number | null;
    status: boolean;
}

export interface ILeague {
    id: number;
    api_id: number;
    name: string;
    slug: string;
    stage?: string;
    champ: Partial<IChamp>;
    champ_id: number | null;
    teams: ILeagueTeam[];
    results: ILeagueResult[];
    status: boolean;
}

export interface ILeagueResult {
    id: number;
    date: number;
    res1: number;
    res2: number;
    champ: ILeague;
    champ_id: number;
    home: ILeagueTeam;
    team1: number;
    team2: number;
    away: ILeagueTeam;
    stamp: number;
    api_id: number;
    is_info: boolean;
    time?: string;
    tour?: number;
    info?: IMatchInfo;
}

export interface ILeagueTeam {
    id: number;
    api_id: number | null;
    name: string;
    slug?: string | null;
    sprite?: string | null;
    champ: ILeague;
    champ_id: number | null;
    games: number;
    win: number;
    draw: number;
    lost: number;
    goals: number;
    missed: number;
    diff: number;
    points: number;
    order: number;
    team?: Partial<ITeam>;
    team_id?: number | null;
    status: boolean;
    results1: ILeagueResult[];
    results2: ILeagueResult[];
}


export interface IEcup {
    id: number;
    api_id: number;
    name: string;
    slug: string;
    stage: string;
    stands: {id: number;
        games: number;
        win: number;
        draw: number;
        lost: number;
        goals: number;
        missed: number;
        diff: number;
        points: number;
        order: number;
        group: string;
        ecup: IEcup;
        ecupTeam: IEcupTeam;
        team_id: number;}[];
    results: IEcupResult[];
    posts: IPost[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ITeam {
    id: number;
    api_id: number;
    name: string;
    slug: string | null;
    img: string;
    sprite: string;
    champ: IChamp;
    champ_id: number  | null;
    games: number;
    win: number;
    draw: number;
    lost: number;
    goals: number;
    missed: number;
    diff: number;
    points: number;
    order: number;
    team: ITeam;
    team_info: {
        pres: string;
        site: string;
        stad: string;
        year: number;
        coach: string;
    };
    status: boolean;
    posts: IPost[];
    players: IPlayer[];
    results1: IResult[];
    results2: IResult[];
    resultsTour1: IResult[];
    resultsTour2: IResult[];
    ecupTeam: IEcupTeam;
}


export interface IResult {
    id: number;
    date: number | string;
    res1: number;
    res2: number;
    champ: IChamp;
    champ_id: number;
    home: ITeam;
    away: ITeam;
    team1: number;
    team2: number;
    stamp: number;
    api_id: number | string;
    is_info: boolean;
    time: string;
    tour: number;
    info: IMatchInfo | null;
}

export interface ITourResult {
    champ: {
        name: string;
        slug: string;
    },
    tour: {
        num: number;
        scores: {
            [index: number]: IResult[]
        }[];
    },
}



export interface IMatchInfo {
    id: number;
    lineups: Record<string, any>;
    info: Record<string, any>;
    ch_res: number;
    c_res: number;
    ecup_res: number;
    champResult: IResult;
    ecupResult: IEcupResult;
    cupResult: ICupResult;
    leagueResult: ILeagueResult;

}

export interface IEcupTeam {
    id: number;
    api_id: number | null;
    name: string;
    sprite: string;
    team: ITeam;
    ecupStand: IEcupStand[];
    results1: IEcupResult[];
    results2: IEcupResult[];
    team_id: number | null;
    status: boolean;
}

/*export interface IEcupStand{
    id: number;
    games: number;
    win: number;
    draw: number;
    lost: number;
    goals: number;
    missed: number;
    diff: number;
    points: number;
    order: number;
    group: string;
    ecup: IEcup;
    ecupTeam: IEcupTeam;
    team_id: number;
}*/

export interface IEcupStand {
    name: string;
    slug: string;
    group: string;
    team_id: number;
    ecup: IEcup;
    ecupTeam: IEcupTeam;
    stands: {
        [index: string]: {
            teams: {
                games: number;
                win: number;
                draw: number;
                lost: number;
                goals: number;
                missed: number;
                diff: number;
                points: number;
                slug: string;
                sprite: string;
            }[]
        }
    };
}


export interface IEcupResult {
    id: number;
    date: number;
    res1: number;
    res2: number;
    ecup: IEcup;
    ecup_id: number;
    home: IEcupTeam;
    team1: number;
    team2: number;
    away: IEcupTeam;
    stamp: number;
    api_id: number;
    is_info: boolean;
    time: string;
    tour: number;
    group: string;
    stage: string;
    order: number;
    info: IMatchInfo;
    scores: {[index: number]: Partial<IEcupResult>[]};
}

export interface ICountry {
    id: number;
    name: string;
    parse_name: string;
    players: IPlayer[];
}

export interface IPost {
    id: number;
    img: {
        original: string;
        thumbnail: string;
    };
    title: string;
    slug: string;
    subtitle: string;
    body: string;
    source: string;
    champ: IChamp;
    champ_id: number | null;
    ecup: IEcup;
    ecup_id: number | null;
    rates: IRate[];
    rate: number;
    teams: ITeam[];
    players: IPlayer[];
    tags: ITag[];
    comments: IComment[];
    date: number;
    post: IPost;
    is_headline: boolean;
    status: boolean;
}

export interface ITag {
    id: number;
    name: string;
    slug: string;
    posts: IPost[];
    tag: ITag;
}

export interface IPlayer {
    id: number;
    api_id: number;
    player_id?: number | null;
    name: string;
    slug: string;
    img: string;
    team: Partial<ITeam>;
    team_id: number;
    number: number;
    country: ICountry | string;
    country_id: number | null;
    position: string;
    position_id: number;
    info: Record<string, any>;
    scorer: IScorer;
    goals: number;
    player: {
        goals: number;
        img: string;
        name: string;
        slug: string;
        team: {
            name: string,
            slug: string,
            sprite: string,
        }
    };
    posts: IPost[];
}


/*export interface IScorer {
    id: number;
    api_id: number;
    champ: IChamp;
    champ_id: number;
    goals: number;
    name: string;
    player: IPlayer;
    player_id: number;
}*/

export interface IScorer {
    champ: {
        name: string;
        slug: string;
    },
    players: {
        goals: number;
        img: string;
        name: string;
        slug: string;
        team: {
            name: string,
            slug: string,
            sprite: string,
        }
    }[]

}

export interface IRate {
    id: number;
    user: IProfile;
    user_id: number;
    post: IPost;
    post_id: number;
    rate: number;
}


export interface IProfile {
    id: number;
    user_id: string;
    rates: IRate[];
    login: string;
    avatar: string;
    email: string;
    comments: IComment[];
    commentLikes: ICommentLike[];
}


export interface IComment {
    id: number;
    user: IProfile;
    user_id: number;
    post: IPost;
    post_id: number;
    body: string;
    userLikes?: ICommentLike[];
    _count: { userLikes: number};
    quote: Record<string, any>;
    stamp: number;
}


export interface ICommentLike {
    id: number;
    user: IProfile;
    user_id: number;
    comment: IComment;
    comment_id: number;
    like: number;
}






