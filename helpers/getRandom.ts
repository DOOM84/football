export default (high: number, low: number): number => {
    high++;
    return Math.floor((Math.random()) * (high - low)) + low;
}


