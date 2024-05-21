import prisma from '~/helpers/prisma';
import matchInfoTransformer from "~/utils/transformers/matchInfoTransformer";
import {IChampDB, IPost, IScore, ISmallPost, ITour} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import singleChampTransformer from "~/utils/transformers/singleChampTransformer";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query = getQuery(event);

        const champMatch = await prisma.matchInfo.findFirst({
            where: {
                ch_res: +query.apiId!,
            },
            include: {
                champResult: {
                    include: {
                        home: {select: {slug: true, sprite: true, name: true, api_id: true}},
                        away: {select: {slug: true, sprite: true, name: true, api_id: true}},
                        },
                    }
                }
            })

        const ecupMatch = await prisma.matchInfo.findFirst({
            where: {
                ecup_res: +query.apiId!,
            },
            include: {
                ecupResult: {
                    include: {
                        home: {
                            include: {
                                team: true
                            }
                        },
                        away: {
                            include: {
                                team: true
                            }
                        },
                    }
                }
            }
        })

        if(!champMatch && !ecupMatch){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const res = champMatch || ecupMatch as Record<string, any>;

        let posts: ISmallPost[] = [];
        let ecupResults: Record<string, any> = {}
        let tourResults: ITour | {} = {};

        if(ecupMatch?.ecupResult?.ecup_id){
            const ecup = await prisma.ecup.findFirst({
                where: {
                    id: ecupMatch.ecupResult.ecup_id,
                },
                include: {
                    results: {
                        orderBy: {
                            stamp: 'asc',
                        },
                        include: {
                            info: {
                                select: {
                                    info:true
                                }
                            },
                            ecup: {
                                select: {slug: true}
                            },
                            home: {
                                include: {
                                    team: true
                                }
                            },
                            away: {
                                include: {
                                    team: true
                                }
                            },
                        }
                    },
                    posts: query.loadPosts ? {
                        where: {
                            status: true,
                        },
                        include: {
                            ecup: true,
                        },
                        orderBy: {
                            date: 'desc',
                        },
                        take: 10
                    } : false,
                },

            })

            posts = postListTransformer(ecup!.posts as unknown as IPost[]);

            const {groupResults, poResults} =
                singleEcupResultsTransformer(ecup!.results as unknown as IScore[]);

            ecupResults = {groupResults, poResults}
        }

        if(champMatch?.champResult?.champ_id){
            const champ = await prisma.champ.findFirst({
                where: {
                    id: champMatch.champResult.champ_id
                },
                include: {
                    posts: query.loadPosts ? {
                        where: {
                            status: true,
                        },
                        include: {
                            ecup: true,
                            champ: true
                        },
                        orderBy: {
                            date: 'desc',
                        },
                        take: 10
                    } : false,
                    tour: {
                        orderBy: {
                            stamp: 'asc',
                        },
                        include: {
                            info: {
                                include: {info: {select: {info:true}}}
                            },
                            home: {select: {slug: true, sprite: true, name: true, api_id: true}},
                            away: {select: {slug: true, sprite: true, name: true, api_id: true}},
                            champ: {select: {name: true, slug: true}}
                        }
                    },
                },
            })

            posts  = postListTransformer(champ!.posts as unknown as IPost[]);

            tourResults  = singleChampTransformer(champ as unknown as IChampDB);
        }






     //   let postsDb: unknown = [];


        /*if(query.loadPosts){
            if(res!.champResult?.champ_id){
                postsDb = await prisma.post.findMany({
                    where: {
                        champ_id: +res!.champResult?.champ_id,
                        status: true,
                    },
                    include: {
                        ecup: true,
                        champ: true
                    },
                    orderBy: {
                        date: 'desc',
                    },
                    take: 10
                }) as unknown as IPost[]
            }

            if(res!.ecupResult?.ecup_id){
                postsDb = await prisma.post.findMany({
                    where: {
                        ecup_id: +res!.ecupResult?.ecup_id,
                        status: true,
                    },
                    include: {
                        ecup: true,
                        champ: true
                    },
                    orderBy: {
                        date: 'desc',
                    },
                    take: 10
                }) as unknown as IPost[]
            }

             posts = postListTransformer(postsDb as unknown as IPost[]);
        }*/

        const mixedSquads = [];

        if(Array.isArray(res!.lineups)){
            for (let i = 0; i < res!.lineups!.length; i++) {
                if(Array.isArray(res!.lineups[i].squads)){
                for (let j = 0; j < res!.lineups[i].squads.length; j++) {
                    const playerSquad = await prisma.player.findFirst({
                        where: {
                            api_id: +res!.lineups[i].squads[j].player.id
                        }
                    })
                    res!.lineups[i].squads[j].player.slug = playerSquad?.slug || null;
                    res!.lineups[i].squads[j].player.img = playerSquad?.img || null;
                    mixedSquads.push(res!.lineups[i].squads[j].player)
                }
                }
                if(Array.isArray(res!.lineups[i].substitutes)) {
                    for (let k = 0; k < res!.lineups[i].substitutes.length; k++) {
                        const playerSub = await prisma.player.findFirst({
                            where: {
                                api_id: +res!.lineups[i].substitutes[k].player.id
                            }
                        })
                        res!.lineups[i].substitutes[k].player.slug = playerSub?.slug || null;
                        res!.lineups[i].substitutes[k].player.img = playerSub?.img || null;
                        mixedSquads.push(res!.lineups[i].substitutes[k].player)
                    }
                }
            }
        }

        if(Array.isArray(res!.info)){

            for (let i = 0; i < res!.info!.length; i++) {

                if(res!.info[i]!.assist?.id){

                    const assist = mixedSquads.length ?
                        mixedSquads.filter(pl => pl.id === +res!.info[i]!.assist.id)[0] :
                        await prisma.player.findFirst({
                        where: {
                            api_id: +res!.info[i]!.assist.id
                        }
                    })
                    res!.info[i]!.assist.slug = assist?.slug || null;
                    res!.info[i]!.assist.img = assist?.img || null;
                }

                if(res!.info[i]!.player?.id){
                    const player = mixedSquads.length ?
                        mixedSquads.filter(pl => pl.id === +res!.info[i]!.player.id)[0] :
                        await prisma.player.findFirst({
                            where: {
                                api_id: +res!.info[i]!.player.id
                            }
                        })
                    res!.info[i]!.player.slug = player?.slug || null;
                    res!.info[i]!.player.img = player?.img || null;
                }
            }
        }

        const details = matchInfoTransformer(res as Record<string, any>)

        return {match: res, ...details, posts, mixedSquads, ecupResults, tourResults };

    }catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})
