import algoliasearch from "algoliasearch";
const runtimeConfig = useRuntimeConfig();
import prisma from '~/helpers/prisma';
import teamPlayersTransformer from "~/utils/transformers/teamPlayersTransformer";
import {IPlayer} from "~/types/interfaces";

export default defineEventHandler(async (event) => {
    try {
        const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);

        let {term,
            category,
            offset,
            limit,
            postsLimit,
            playersLimit,
            teamsLimit,
        } = getQuery(event);

        if(category){
            if(category === 'teams') {
               return  await prisma.team.findMany({
                    take: +limit!,
                    skip: +offset!,
                    select: {name: true, sprite: true, slug: true, img: true},
                    where: {
                        OR: [
                            {
                                name: {
                                    mode: 'insensitive',
                                    contains: term as string
                                },
                            },
                            {
                                slug: {
                                    mode: 'insensitive',
                                    contains: term as string
                                }
                            }
                        ]
                    },
                });
            }

            const index = client.initIndex(category as string);
            const {hits} = await index.search(term as string, {
                offset: +offset!,
                attributesToRetrieve: category === 'posts' ?
                    ['img', 'title', 'slug', 'subtitle', 'date', 'status', 'champ', 'ecup']:
                    ['img', 'name', 'slug', 'team', 'position_id'],
                length: +limit!,
            });

            if(category === 'players'){
                return teamPlayersTransformer(hits as unknown as IPlayer[]);
            }

            return hits;
        }

        const teams = await prisma.team.findMany({
           // take: +teamsLimit!,
            select: {name: true, sprite: true, slug: true, img: true},
            where: {
                OR: [
                    {
                        name: {
                            mode: 'insensitive',
                            contains: term as string
                        },
                    },
                    {
                        slug: {
                            mode: 'insensitive',
                            contains: term as string
                        }
                    }
                    ]
            },
        });


        const queries = [{
            indexName: 'posts',
            query: term,
            params: {
                offset: 0,
                attributesToRetrieve: ['img', 'title', 'slug', 'subtitle', 'date', 'status', 'champ', 'ecup'],
                //hitsPerPage: +limit,
                length: +postsLimit!,
            }
        }, {
            indexName: 'players',
            query: term,
            params: {
                offset: 0,
                attributesToRetrieve: ['img', 'name', 'slug', 'team', 'position_id'],
                //hitsPerPage: +limit,
                length: +playersLimit!,
            }
        }];

        const {results} = await client.multipleQueries(queries as []) as unknown as Record<string, any>;

        return {
            posts: {results: results[0].hits, count: results[0].nbHits},
            players: {results:  teamPlayersTransformer(results[1].hits as unknown as IPlayer[]), count: results[1].nbHits},
            teams: {results:  teams.slice(0, +teamsLimit!), count: teams.length},
        }

    } catch (e) {
        console.log(e);
    }

})
