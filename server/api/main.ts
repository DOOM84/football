import prisma from '~/helpers/prisma';
import ecupTransformer from "~/utils/transformers/ecupTransformer";
import champTransformer from "~/utils/transformers/champTransformer";
import {IChampDB, IEcupDB, IEcupStands, IPost, IScorer, ISmallPost, ITour} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import champScorersTransformer from "~/utils/transformers/champScorersTransformer";
import moment from "moment";

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
        });

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
        })

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
        })

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
        });

        const ecupStands: IEcupStands[] = ecupTransformer(ecups as unknown as IEcupDB[]);

        const tourResults: ITour[]  = champTransformer(champs as unknown as IChampDB[]);

        const delayResults: ITour[]  = champTransformer(champs as unknown as IChampDB[], 'results')
            .filter(champ => Object.keys(champ.tour!.scores).length);

        const players: IScorer[]  = champScorersTransformer(champs as unknown as IChampDB[]);

        const posts: ISmallPost[]  = postListTransformer(postsDb as unknown as IPost[]);

        const headLines: ISmallPost[]  = postListTransformer(headLinesDb as unknown as IPost[]);

        return {champs, tourResults, ecupStands, posts, headLines, players, delayResults /*rrr*/};

    }catch (e) {
        console.log(e);
    }

})
