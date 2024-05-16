export default (path: string): string => {

    return (process.cwd() + path).replace(".output/", "");

}


