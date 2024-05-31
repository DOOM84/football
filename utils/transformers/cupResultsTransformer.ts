import type {ICupResult} from "~/types/interfaces";
import groupBy from "~/helpers/groupBy";
import getGoals from "~/utils/getGoals";


export default ((cupResults: ICupResult[]) => {


   /* const groupRes = ecupsResults.filter(res => !res.stage);
    const poRes = ecupsResults.filter(res => res.stage)*/

   /* const groupResults = groupBy(groupRes, 'group') as { [index: IEcupResult['group']]: IEcupResult[] };

    (Object.keys(groupResults) as unknown as string[]).forEach(function (group) {
        (groupResults[group] as unknown as {
            [index: IEcupResult['tour']]: IEcupResult[]
        }) = groupBy(groupResults[group], 'tour');
        (Object.keys(groupResults[group]) as unknown as number[]).forEach(tour => {
            (groupResults[group][tour] as unknown as {
                [index: IEcupResult['date']]: IEcupResult[]
            }) = groupBy(groupResults[group][tour] as unknown as IEcupResult[], 'date');
            (Object.keys(groupResults[group][tour]) as unknown as number[]).forEach(function (date) {
                (groupResults[group][tour] as unknown as {
                    [index: IEcupResult['date']]: Record<string, any>[]
                })[date] = (groupResults[group][tour] as unknown as {
                    [index: IEcupResult['date']]: IEcupResult[]
                })[date].map((result: Partial<IEcupResult>) => {
                    return {
                        date: result.date,
                        res1: result.res1,
                        res2: result.res2,
                        stamp: result.stamp,
                        time: result.time,
                        api_id: result.api_id,
                        is_info: result.is_info,
                        ecup: result.ecup,
                        info: getGoals((result.info?.info as any[]) || null),
                        home: {
                            sprite: result.home?.sprite,
                            name: result.home?.name,
                            slug: result.home?.team?.slug,
                            api_id: result.home?.team?.api_id || result.home?.api_id
                        },
                        away: {
                            sprite: result.away?.sprite,
                            name: result.away?.name,
                            slug: result.away?.team?.slug,
                            api_id: result.away?.team?.api_id || result.away?.api_id
                        }
                    }
                })
            })
        })
    })*/


    const grouppedRes = groupBy(cupResults, 'stage') as Record<string, Partial<ICupResult>[]>;
    const results: Partial<ICupResult>[] = [];
    Object.keys(grouppedRes).forEach(function (stage) {
        results.push(
            {
                stage: stage,
                //order: grouppedRes[stage][0].order,
                scores: groupBy(grouppedRes[stage].map(result => {
                    return {
                        date: result.date,
                        res1: result.res1,
                        res2: result.res2,
                        stamp: result.stamp,
                        time: result.time,
                        api_id: result.api_id,
                        is_info: result.is_info,
                        ecup: result.ecup,
                        info: getGoals((result.info?.info as any []) || null),
                        home: {
                            sprite: result.home!.sprite,
                            name: result.home!.name,
                            slug: result.home!.team?.slug,
                            api_id: result.home?.team?.api_id || result.home?.api_id
                        },
                        away: {
                            sprite: result.away!.sprite,
                            name: result.away!.name,
                            slug: result.away!.team?.slug,
                            api_id: result.away?.team?.api_id || result.away?.api_id

                        }
                    }
                }), 'date')

            })
    })

    return {
        results: results as {
            stage: string;
            scores: ICupResult['scores'];
        }[]
    };
})