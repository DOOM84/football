import prisma from '~/helpers/prisma';
import {IEcupDB, IEcupStands, IPost, IScore, ISmallPost, } from "~/types/interfaces";
import postTransformer from "~/utils/transformers/postTransformer";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import singleEcupTransformer from "~/utils/transformers/singleEcupTransformer";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

        const ecup = await prisma.ecup.findFirst({
            where: {
                status: true,
                slug: query.ecup?.toString(),
            },
            include: {
                posts: {
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
                },
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
                },
            },
        })

        if(!ecup){
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
        const posts: ISmallPost[] = postListTransformer(ecup.posts as unknown as IPost[]);

        const {groupResults, poResults} =
            singleEcupResultsTransformer(ecup.results as unknown as IScore[]);

        const ecupStands: IEcupStands = singleEcupTransformer(ecup as unknown as IEcupDB);

        const post: Partial<IPost> = postTransformer(postDb as unknown as Partial<IPost>);

        return {ecup: {name: ecup.name, slug: ecup.slug, id: ecup.id}, post, posts, ecupStands, groupResults, poResults};

    }catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})