import type {IPlayer, IPost, ITeam} from "~/types/interfaces";

export const useResult = () => {
    return useState('result', (): {posts: {results: IPost[], count: number},
        players: {results: IPlayer[], count: number},
        teams: {results: ITeam[], count: number},} => {
        return {
            posts: {results: [], count: 0},
            players: {results: [], count: 0},
            teams: {results: [], count: 0},
        }
    })
}