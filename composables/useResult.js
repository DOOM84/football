export const useResult = () => {
    return useState('result', () => {
        return {
            posts: {results: [], count: 0},
            players: {results: [], count: 0},
        }
    })
}