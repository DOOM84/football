import type {IEcupResult, IResult} from "~/types/interfaces";
import groupBy from "~/helpers/groupBy";

export default ((ecupsResults: IEcupResult[]) => {


    const groupRes = ecupsResults.filter(res => !res.stage);
    const poRes = ecupsResults.filter(res => res.stage)

    const groupResults = groupBy(groupRes, 'group') as { [index: IEcupResult['group']]: IEcupResult[] };

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
    })


    const grouppedPoRes = groupBy(poRes, 'stage') as Record<string, Partial<IEcupResult>[]>;
    const poResults: Partial<IEcupResult>[] = [];
    Object.keys(grouppedPoRes).forEach(function (stage) {
        poResults.push(
            {
                stage: stage,
                //order: grouppedPoRes[stage][0].order,
                scores: groupBy(grouppedPoRes[stage].map(result => {
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
        groupResults: groupResults as unknown as {
            [index: string]: {
                [index: number]: {
                    [index: number]: Partial<IEcupResult>[]
                }
            }
        }, poResults: poResults as {
            stage: string;
            scores: IEcupResult['scores'];
        }[]
    };
})

function getGoals(info: any[] | null): Record<any, any[]> | null {

    if (!info) {
        return null;
    }

    const goalsOnly = info.filter((event: { type: string; detail: string; comments: string }) =>
        event.type.toLowerCase() === 'goal'
        && event.detail.toLowerCase() !== 'missed penalty'
        && event.comments?.toLowerCase() !== 'penalty shootout'
    );

    // tour.info = null;
    let res;

    if (Array.isArray(goalsOnly) && goalsOnly.length) {
        res = groupBy(goalsOnly.map(goal => {
            goal.teamId = goal.team.id;
            return goal;
        }), 'teamId') as Record<any, any[]>;
    } else {
        return null;
    }
    return res;
}