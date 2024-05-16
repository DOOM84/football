import prisma from '~/helpers/prisma';
import {IChampDB, IPost, ISmallPost, ITour} from "~/types/interfaces";
import postTransformer from "~/utils/transformers/postTransformer";
import singleChampTransformer from "~/utils/transformers/singleChampTransformer";
import postListTransformer from "~/utils/transformers/postListTransformer";
import moment from "moment";
import champTransformer from "~/utils/transformers/champTransformer";

export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

       // await new Promise(resolve => setTimeout(resolve, 5000));

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
                    take: 10
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
                },
            },
        })

        if(!champ){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const postDb = await prisma.post.findFirst({
            where: {
                status: true,
                slug: query.slug?.toString(),
            },
            include: {
                rates: {select: {rate: true}},
                players: {include: {
                    player: {select: {slug: true, img: true, name: true}}
                    }},
                tags: {include: {
                        tag: {select: {slug: true, name: true}}
                    }},
                teams: {include: {
                        team: {select: {name: true, slug: true, sprite: true}}
                    }},
                /*_count: {
                    select: { comments: true},
                },*/
                comments: {
                    include: {
                        userLikes: {select: {like: true}},
                        user: {
                            select: {login: true, id: true, avatar: true}
                        }
                    },
                    orderBy: {
                        stamp: 'asc',
                    }
                },
            },
        })

        if(!postDb){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }
        const posts: ISmallPost[]  = postListTransformer(champ?.posts as unknown as IPost[]);

        const post: Partial<IPost> = postTransformer(postDb as unknown as Partial<IPost>);

        const tourResults: ITour  = singleChampTransformer(champ as unknown as IChampDB);

        const delayResults: ITour[]  = champTransformer([champ] as unknown as IChampDB[], 'results')
            .filter(champ => Object.keys(champ.tour!.scores).length);

        return {post, tourResults, posts, champ, delayResults};

    }catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})