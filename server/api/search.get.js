import algoliasearch from "algoliasearch";
const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    try {
        const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);

        let {term, category, offset, limit, postsLimit, playersLimit} = useQuery(event);

        if(category){
            const index = client.initIndex(category);
            const {hits} = await index.search(term, {
                offset: +offset,
                attributesToRetrieve: category === 'posts' ?
                    ['title', 'slug', 'images', 'date', 'champ', 'ecup', 'ecup_name', 'champ_name']:
                    ['name', 'photo', 'objectID', 'team'],
                length: +limit,
            });

            return hits;
        }


        const queries = [{
            indexName: 'posts',
            query: term,
            params: {
                offset: 0,
                attributesToRetrieve: ['title', 'slug', 'images', 'date', 'champ', 'ecup', 'ecup_name', 'champ_name'],
                //hitsPerPage: +limit,
                length: +postsLimit,
            }
        }, {
            indexName: 'players',
            query: term,
            params: {
                offset: 0,
                attributesToRetrieve: ['name', 'photo', 'objectID', 'team'],
                //hitsPerPage: +limit,
                length: +playersLimit,
            }
        }];

        const {results} = await client.multipleQueries(queries);

        return {
            posts: results[0].hits,
            postsResCount: results[0].nbHits,
            players: results[1].hits,
            playersResCount: results[1].nbHits,
        }

    } catch (e) {
        console.log(e);
    }

})
