import prisma from '~/helpers/prisma';
import champTransformer from "~/utils/transformers/champTransformer";
import type {IChamp, IEcup, ITourResult} from "~/types/interfaces";
import singleChampTransformer from "~/utils/transformers/singleChampTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import moment from "moment";


export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

        if(query.ecup){
            const ecup = await prisma.ecup.findFirst({
                where: {
                    status: true,
                    slug: query.ecup?.toString(),
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
                },

            }) as unknown as IEcup;

            const {groupResults, poResults} =
                singleEcupResultsTransformer(ecup!.results);

            return {groupResults, poResults};
        }

        if(query.champ){
            const champ = await prisma.champ.findFirst({
                where: {
                    status: true,
                    slug: query.champ?.toString(),
                },
                include: {
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
            }) as unknown as IChamp;

            const tourResults  = singleChampTransformer(champ);

            return {tourResults};
        }


        const now = Date.now();
        const startDay = moment(now).startOf('day').format('x');
        const endDay = moment(now).endOf('day').format('x');

        const ecups = await prisma.ecup.findMany({
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
            }
        }) as unknown as IEcup[];

        const champs = await prisma.champ.findMany({
            where: {
                status: true,
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
            },
        }) as unknown as IChamp[];

        const tourResults  = champTransformer(champs);

        const ecupResults = ecups.map(ecup=> ({
            ...singleEcupResultsTransformer(ecup.results),
            ecup: ecup.name
        }));

        const delayResults: ITourResult[]  = champTransformer(champs, 'delay')
            .filter(champ => Object.keys(champ.tour!.scores).length);

        const relegationResults: ITourResult[]  = champTransformer(champs, 'relegation', true)
            .filter(champ => Object.keys(champ.tour!.scores).length);

        return {tourResults, delayResults, relegationResults, ecupResults};

    }catch (e) {
        console.log(e);
    }

})
