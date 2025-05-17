export default (str: string): string => {
    if(str === null || str === undefined){return 'unknown'}
    return  str.replace("&apos;", "'").replace("&quot;", '"')
        .replace("&ndash;", "-").replace("&mdash;", '—')
        .replace("Ã©", 'é')
        .replace("Ãº", 'ú')
        .replace("Ã", 'í')
        .replace("í¡", 'á')
        .replace("í³", 'ó')
        .replace("í§", 'ç')
        .replace("í£", 'ã')
        .replace("Ãª", 'ê')
}


