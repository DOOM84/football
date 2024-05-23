import prisma from '~/helpers/prisma';
import {IChamp, IPost, IScorer, ITourResult} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleChampTransformer from "~/utils/transformers/singleChampTransformer";
import singleChampScorersTransformer from "~/utils/transformers/singleChampScorersTransformer";
import moment from "moment/moment";
import champTransformer from "~/utils/transformers/champTransformer";

export default defineEventHandler(async (event) => {

    try {

        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

        const now = Date.now();

        const startDay = moment(now).startOf('day').format('x');
        const endDay = moment(now).endOf('day').format('x');

        const champ = await prisma.champ.findFirst({
            where: {
                status: true,
                slug: query.champ?.toString(),
            },
            include: {
                posts: {
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
                    take: +query.count!
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
        }) as unknown as IChamp;

        if(!champ){
            throw createError({
                statusCode: 404,
                statusMessage: 'Lesson not found',
            });
        }

        const headLinesDb = await prisma.post.findMany({
            where: {
                status: true,
                is_headline: true,
                champ_id: champ?.id,
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

        const posts: Partial<IPost[]>  = postListTransformer(champ?.posts as unknown as IPost[]);

        const tourResults: Partial<ITourResult>  = singleChampTransformer(champ);

        const headLines: Partial<IPost[]>  = postListTransformer(headLinesDb);

        const players: Partial<IScorer> = singleChampScorersTransformer(champ);

        const delayResults: ITourResult[]  = champTransformer([champ], 'results')
            .filter(champ => Object.keys(champ.tour!.scores).length);


        return {champ, tourResults, posts, headLines, players, delayResults};

    }catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Lesson not found',
        });
    }

})