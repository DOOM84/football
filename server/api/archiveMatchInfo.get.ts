import prisma from '~/helpers/prisma';
import matchInfoTransformer from "~/utils/transformers/matchInfoTransformer";
import type {
    IChamp,
    IPost,
    IMatchInfo,
    ITourResult,
    ITeam,
    IEcupTeam,
    IResult,
    IEcup,
    IEcupResult, ICupTeam, ICupResult, ICup
} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import singleChampTransformer from "~/utils/transformers/singleChampTransformer";
import type {Season} from "~/types/types";


export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query = getQuery(event) as {
            season: Season;
            apiId: number;
            loadPosts: boolean;
        };

        if (!query.season) {
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        let cupTeams: ICupTeam[] = [];

        let ecupTeams: IEcupTeam[] = [];

        const champMatch = await (prisma[`matchInfo${query.season}`] as any).findFirst({
            where: {
                ch_res: +query.apiId!,
            },
        }) as unknown as IMatchInfo;

        const ecupMatch = await (prisma[`matchInfo${query.season}`] as any).findFirst({
            where: {
                ecup_res: +query.apiId!,
            },
        }) as unknown as IMatchInfo;

        const cupMatch = await (prisma[`matchInfo${query.season}`] as any).findFirst({
            where: {
                c_res: +query.apiId!,
            },
        }) as unknown as IMatchInfo;

        if (!champMatch && !ecupMatch && !cupMatch) {
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const teams = await prisma.team.findMany() as unknown as ITeam[];

        if(champMatch){

            champMatch.champResult = await (prisma[`result${query.season}`] as any).findFirst({
                where: {
                    api_id: +query.apiId!,
                },
            }) as unknown as IResult;

            champMatch.champResult.home = teams.filter(team =>
                team.id === +champMatch.champResult.team1)[0];

            champMatch.champResult.away = teams.filter(team =>
                team.id === +champMatch.champResult.team2)[0];
        }

        if(ecupMatch){

            ecupTeams = await prisma.ecupTeam.findMany() as unknown as IEcupTeam[];

            ecupMatch.ecupResult = await (prisma[`ecupResult${query.season}`] as any).findFirst({
                where: {
                    api_id: +query.apiId!,
                },
            }) as unknown as IEcupResult;

            ecupMatch.ecupResult.home = ecupTeams.filter(team =>
                team.id === +ecupMatch.ecupResult.team1)[0];

            ecupMatch.ecupResult.home.team = teams.filter(team =>
                team.id === +ecupMatch.ecupResult.home.team_id! )[0];

            ecupMatch.ecupResult.away = ecupTeams.filter(team =>
                team.id === +ecupMatch.ecupResult.team2)[0];

            ecupMatch.ecupResult.away.team = teams.filter(team =>
                team.id === +ecupMatch.ecupResult.away.team_id! )[0]
        }

        if(cupMatch){
            cupTeams = await prisma.cupTeam.findMany() as unknown as ICupTeam[];

            cupMatch.cupResult = await (prisma[`cupResult${query.season}`] as any).findFirst({
                where: {
                    api_id: +query.apiId!,
                },
            }) as unknown as ICupResult;

            cupMatch.cupResult.home = cupTeams.filter(team =>
                team.id === +cupMatch.cupResult.team1)[0];

            cupMatch.cupResult.home.team = teams.filter(team =>
                team.id === +cupMatch.cupResult.home.team_id! )[0];

            cupMatch.cupResult.away = cupTeams.filter(team =>
                team.id === +cupMatch.cupResult.team2)[0];

            cupMatch.cupResult.away.team = teams.filter(team =>
                team.id === +cupMatch.cupResult.away.team_id! )[0]
        }

        const res = champMatch || ecupMatch  || cupMatch;

        let posts: IPost[] = [];
        let ecupResults: Record<string, any> = {}
        let tourResults: ITourResult | {} = {};

        if (cupMatch?.cupResult?.cup_id) {
            const cup = await prisma.cup.findFirst({
                where: {
                    id: cupMatch.cupResult.cup_id,
                },
                include: {
                    champ: {
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
                        },
                    }
                }
            }) as unknown as ICup;

            (res.cupResult.cup as unknown as Partial<ICup>) = {name: cup!.name}
            posts = postListTransformer(cup!.champ!.posts as unknown as IPost[]);

        }

        if (ecupMatch?.ecupResult?.ecup_id) {
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
                                    info: true
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

            }) as unknown as IEcup;

            res.ecupResult.ecup = {name: ecup.name} as any;

            posts = postListTransformer(ecup!.posts);

            const {groupResults, poResults} =
                singleEcupResultsTransformer(ecup!.results);

            ecupResults = {groupResults, poResults}
        }

        if (champMatch?.champResult?.champ_id) {
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
                                include: {info: {select: {info: true}}}
                            },
                            home: {select: {slug: true, sprite: true, name: true, api_id: true}},
                            away: {select: {slug: true, sprite: true, name: true, api_id: true}},
                            champ: {select: {name: true, slug: true}}
                        }
                    },
                },
            }) as unknown as IChamp;

            res.champResult.champ = {name: champ.name} as any;

            posts = postListTransformer(champ!.posts);

            tourResults = singleChampTransformer(champ);
        }

        const mixedSquads = [];

        if (Array.isArray(res!.lineups)) {
            for (let i = 0; i < res!.lineups!.length; i++) {
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

        if (Array.isArray(res!.info)) {

            for (let i = 0; i < res!.info!.length; i++) {

                if (res!.info[i]!.assist?.id) {

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

                if (res!.info[i]!.player?.id) {
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

        return {match: res, ...details, posts, mixedSquads, ecupResults, tourResults};

    } catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})