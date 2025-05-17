export default (array: any[], property: string): any[] => {
    return array.filter((obj, index, self) =>
        index === self.findIndex((o) => o[property] === obj[property])
    );
}


