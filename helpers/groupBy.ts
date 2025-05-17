export default (data: Record<string | number, any>[], property: string): {} => {
    return data.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}


