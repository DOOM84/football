import prisma from '~/helpers/prisma';
import ecupTransformer from "~/utils/transformers/ecupTransformer";
import champTransformer from "~/utils/transformers/champTransformer";
import type {IChamp, IEcup, IPost, IScorer, ITourResult} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import moment from "moment";
import champScorersTransformer from "~/utils/transformers/champScorersTransformer";

export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const ecups = await prisma.ecup.findMany({
            orderBy: {
                id: 'asc',
            },
            include: {
                stands: {
                    orderBy: {
                        order: 'asc',
                    },
                    include: {
                        ecupTeam: {
                            include: {
                                team: true
                            }
                        }
                    }
                }
            }
        }) as unknown as IEcup[];

        const postsDb = await prisma.post.findMany({
            where: {
                status: true,
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                ecup: true,
                champ: true
            },
            take: 35
        }) as unknown as IPost[];

        const headLinesDb = await prisma.post.findMany({
            where: {
                status: true,
                is_headline: true
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                ecup: true,
                champ: true
            },
            take: 4
        }) as unknown as IPost[];

        const now = Date.now();

        const startDay = moment(now).startOf('day').format('x'); //Math.floor(Date.now()/1000)
        const endDay = moment(now).endOf('day').format('x');

        const champs = await prisma.champ.findMany({
            where: {
                status: true,
                /*results: {
                    every: {
                        stamp: {
                            gte: Math.floor(Date.now()/1000),
                        },
                        tour: {
                            lt: 18
                        }
                    }
                },*/
            },
            orderBy: {
                id: 'asc',
            },
            include: {
                results: {
                    where: {
                        stamp: {
                            gte: +startDay/1000,
                            lt: Math.floor(+endDay/1000)
                        },
                    },
                    orderBy: {
                        stamp: 'asc',
                    },
                    include: {
                        info: true,
                        home: {select: {slug: true, sprite: true, name: true, api_id: true}},
                        away: {select: {slug: true, sprite: true, name: true, api_id: true}},
                        champ: {select: {name: true, slug: true}}
                    }
                },
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
                scorers: {
                    include: {
                        player: {
                            include: {
                                team: {select: {name: true, sprite: true, slug: true}}
                            }
                        }
                    },
                    orderBy: {
                        goals: 'desc',
                    },
                },
                teams: {
                    where: {
                        status: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                    include: {
                        champ: {select: {name: true, slug: true}}
                    }
                }
            },
        }) as unknown as IChamp[];

        const ecupStands = ecups.map(ecup=> ecupTransformer(ecup));

        const tourResults: ITourResult[] = champTransformer(champs);

        const delayResults: ITourResult[]  = champTransformer(champs, 'delay')
            .filter(champ => Object.keys(champ.tour!.scores).length);

        const relegationResults: ITourResult[]  = champTransformer(champs, 'relegation', true)
            .filter(champ => Object.keys(champ.tour!.scores).length);

        const players: IScorer[] | Partial<IScorer>[]  = champs.map(champ => champScorersTransformer(champ));

        const posts: Partial<IPost[]> = postListTransformer(postsDb);

        const headLines: Partial<IPost[]>  = postListTransformer(headLinesDb);

        return {champs, tourResults, ecupStands, posts, headLines, players, delayResults, relegationResults};

    }catch (e) {
        console.log(e);
    }

})
