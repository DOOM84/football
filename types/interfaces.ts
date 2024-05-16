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

export interface ITeamInfo {
    api_id?: number | null;
    champ: { name: IChampDB["name"]; slug: IChampDB["slug"]; id?: number };
    champ_id: IChampDB["id"] | null;
    team_id?: number | null;
    team?: Record<string, any>;
    id: number;
    name: string;
    slug: string; //| null;
    img: string;
    sprite: string;
    status: boolean;
    diff: number;
    win: number;
    draw: number;
    games: number;
    goals: number;
    lost: number;
    missed: number;
    order: number;
    points: number;
    team_info?: {
        pres: string;
        site: string;
        year: number;
        coach: string;
        stad: string;
    } | {}
}

export interface ITeam {
    name: string;
    img: string;
    slug: string;
    team_info: ITeamInfo['team_info']
}


export interface IChampDB {
    all_tours: number;
    api_id: number;
    current_tour: number;
    id: number;
    name: string;
    slug: string;
    status?: boolean;
    teams: ITeamInfo[];
    scorers?: IPlayer[];
    tour?: IScore[]
    posts?: IPost[]
}

export interface IPlayer {
    id: number;
    champ_id: number;
    goals: number;
    name: string;
    slug: string;
    img: string;
    api_id?: number;
    team_id?: number;
    country?: Record<string, string | number> | string;
    info?: Record<string, string | number>;
    position: string;
    position_id?: number;
    number: number;
    player_id: number;
    team?: IPlayer["player"]["team"];
    player: {
        id: number;
        api_id: number;
        name: string;
        slug: string;
        img: string;
        number?: number;
        team_id: number;
        country_id: number;
        country?: Record<string, string | number>;
        position_id: number;
        posts?: IPost[];
        info: Record<string, string | number>
        team: {
            name: string;
            slug: string;
            sprite: string
        }
    };
}




export interface IScorer {
    champ? : {
        name: string;
        slug: string;
    },
    players: {
        name: string;
        slug: string;
        goals: number;
        img: string;
        team: {
            name: string;
            slug: string;
            sprite: string
        }
    }[]
}

export interface IEcupDB {
    api_id?: number;
    createdAt?: number;
    updatedAt?: number;
    id?: number;
    name: string;
    slug: string;
    stage?: string;
    status?: boolean;
    stands: {
        diff: number;
        win: number;
        draw: number;
        games: number;
        goals: number;
        lost: number;
        missed: number;
        order: number;
        points: number;
        group: string;
        id: number;
        ecup_id: number;
        team_id: number;
        ecupTeam: {
            api_id: number;
            id: number;
            team_id: number;
            name: string;
            sprite: string;
            status: boolean;
            team: ITeamInfo
        }
    }[];
    posts?: ISmallPost[];
}

export interface IEcupStands {
    name?: string;
    slug?: string;
    stands:  Record<string | number, {
        teams: {
            api_id: number;
            diff: number;
            draw: number;
            games: number;
            goals: number;
            lost: number;
            missed: number;
            points: number;
            win: number;
            order: number;
            group: string;
            name: string;
            slug: string | null;
            sprite: string;
        }[]
    }>
}

export interface ITour {
    champ: {
        name: string;
        slug: string;
    },
    tour: {
        num: number;
        scores: Record<string | number, IScore[]>
    }
}

export interface IScore {
    home: {
        name: string;
        slug: string;
        sprite: string;
        team?: any;
        api_id?: number;
    },
    away: {
        name: string;
        slug: string;
        sprite: string;
        team?: any;
        api_id?: number;
    },
    champ?: {
        name: string;
        slug: string;
    },
    ecup?: {
        name: string;
        slug: string;
    },
    info?: Record<string, any> | null,
    champ_id?: number;
    api_id?: number;
    is_info?: boolean;
    id?: number;
    res1 : number;
    res2 : number;
    stamp: number | string;
    team1? : number;
    team2? : number;
    date : string| number;
    time : string;
    tour : number;
    stage? : string;
    order?: number;
    scores?: Record<string | number, Record<string | number, IScore[]>>
}


export interface ISmallPost {
    id: number;
    img: {original: string; thumbnail: string;}/* | string;*/
    title: string;
    date: string | number;
    slug: string;
    status?: boolean;
}
export interface IPost extends ISmallPost{
    champ: {id?: number; name?: string; slug?: string} | null;
    champ_id?: number | null;
    ecup_id?: number | null;
    ecup: {id?: number; name?: string; slug: string} | null;
    subtitle: string;
    rates?: {rate: number}[];
    rate: number;
    comments: IComment[];
    teamsDb?: number[];
    playersDb?: number[];
    tagsDb?: number[];
    newTags?: Partial<ITag>[];
    body: string;
    is_headline: boolean;
    source?: string;
    tags: {id?: number; name: string; slug: string; tag?: any}[];
    players: {id?: number; name: string; slug: string; img: string; player?: any}[];
    teams: {id?: number; name: string; slug: string, sprite: string; team?: any}[];
    updatedAt?: number | string;
    createdAt?: number | string;
}

export interface ITag {
    id: number;
    name: string;
    slug: string;
}

export interface IUser extends User{
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

export interface IComment {
    id: number;
    post_id: number;
    user_id: number;
    body: string;
    stamp: string | number;
    _count: { userLikes: number};
    quote: {
        body: string;
        stamp: number;
        user: { login: string }
    } | null,
    user: {
        avatar: string;
        email: string;
        id: number;
        login: string;
        user_id: string;
    } | null

}
