export default (obj: Record<any, any>) => {
    return Object.keys(obj).sort().reduce(function (result: Record<any, any>, key) {
        result[key] = obj[key];
        return result;
    }, {});
}


