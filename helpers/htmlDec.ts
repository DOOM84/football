export default (str: string): string => {
    return  str.replace("&apos;", "'").replace("&quot;", '"')
        .replace("&ndash;", "-").replace("&mdash;", '—')
        .replace("Ã©", 'é')
        .replace("Ãº", 'ú')
        .replace("Ã", 'í')
        .replace("í¡", 'á')
}


