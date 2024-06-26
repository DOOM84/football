import prisma from '~/helpers/prisma';
import type {IChamp, IEcup, IPost, ITeam} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import ecupTransformer from "~/utils/transformers/ecupTransformer";
import teamPlayersTransformer from "~/utils/transformers/teamPlayersTransformer";
import singleTeamTransformer from "~/utils/transformers/singleTeamTransformer";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };


        const query = getQuery(event);

        const teamDb = await prisma.team.findFirst({
            where: {
                slug: query.slug?.toString(),
            },
            include: {
                players: {
                    orderBy: {
                        position_id: 'asc',
                    },
                },
                champ: true,
                ecupTeam: {
                    include: {
                        ecupStand: {include: {ecup: {select: {slug: true}}}},

                    }
                },
                posts: {
                    orderBy: {
                        assignedAt: 'desc',
                    },
                    include: {
                        post: {include: {champ: true, ecup: true}},
                    },
                    take: 10,
                },
            }
        }) as unknown as ITeam;

        if(!teamDb){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const champ = await prisma.champ.findFirst({
            where: {
                status: true,
                slug: teamDb?.champ?.slug.toString(),
            },
            include: {
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
        })as unknown as IChamp;

        const posts: IPost[]  = postListTransformer(teamDb?.posts.map(post => post.post)
            .filter(post => post.status))

        const forFilter: Record<string, {group: string | null; team_id: number | null;}> = {}

        const ecupIds: string[] | undefined = teamDb?.ecupTeam?.ecupStand.map(ecup => {
            forFilter[ecup.ecup.slug] = {group: ecup.group, team_id: ecup.team_id}
            return ecup.ecup.slug
        })

        const ecupsDb = await prisma.ecup.findMany({
            where: {
                slug: { in: ecupIds || [] },
            },
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
        })as unknown as IEcup[];

        const ecups = ecupsDb.map(ecup => {

            return {...ecup, stands: ecup.stands.filter(stand =>
                    stand.group === forFilter[ecup.slug].group)}
        })

        const ecupStands = ecups.map(ecup => ecupTransformer(ecup)) ;

        const players = teamPlayersTransformer(teamDb?.players)

        const team = singleTeamTransformer(teamDb)


        return {team, champ, posts, ecupStands, players};

    }catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})