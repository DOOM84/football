import type {IScore} from "~/types/interfaces";
import groupBy from "~/helpers/groupBy";

export default ((ecupsResults: IScore[]): Record<string, Record<string | number, any> | Partial<IScore>[]> => {


    const groupRes = ecupsResults.filter(res => !res.stage);
    const poRes = ecupsResults.filter(res => res.stage)

    const groupResults =  groupBy(groupRes, 'group') as Record<string | number, any>;

    Object.keys(groupResults).forEach(function(group){
        groupResults[group] = groupBy(groupResults[group], 'tour') as Record<string | number, Record<string | number, IScore[]>>;
        Object.keys(groupResults[group]).forEach(function(tour: number | string){
            groupResults[group][tour] =  groupBy(groupResults[group][tour], 'date') as Record<string | number, IScore[]>;
            Object.keys(groupResults[group][tour]).forEach(function(date){
                groupResults[group][tour][date] = groupResults[group][tour][date].map((result: Partial<IScore>) => {
                    return {
                        date: result.date,
                        res1: result.res1,
                        res2: result.res2,
                        stamp: result.stamp,
                        time: result.time,
                        api_id: result.api_id,
                        is_info: result.is_info,
                        ecup: result.ecup,
                        info: getGoals(result.info?.info || null),
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

    const grouppedPoRes = groupBy(poRes, 'stage') as Record<string | number, any[]>;
    const poResults: Partial<IScore>[] = [];
    Object.keys(grouppedPoRes).forEach(function(stage){
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
                        info: getGoals(result.info?.info || null),
                        home: {
                            sprite: result.home.sprite,
                            name: result.home.name,
                            slug: result.home.team?.slug,
                            api_id: result.home?.team?.api_id || result.home?.api_id
                        },
                        away: {
                            sprite: result.away.sprite,
                            name: result.away.name,
                            slug: result.away.team?.slug,
                            api_id: result.away?.team?.api_id || result.away?.api_id

                        }
                    }
                }), 'date')

            })
    })

    return {groupResults, poResults};
})

function getGoals(info: any[] | null): Record<any, any> | null{
    
    if(!info){
        return null;
    }
    
    const goalsOnly = info.filter((event: { type: string; detail: string; comments: string }) =>
        event.type.toLowerCase() === 'goal'
        && event.detail.toLowerCase() !== 'missed penalty'
       && event.comments?.toLowerCase() !== 'penalty shootout'
    );

   // tour.info = null;
    let res;

    if(Array.isArray(goalsOnly) && goalsOnly.length){
        res = groupBy(goalsOnly.map(goal => {
            goal.teamId = goal.team.id;
            return goal;
        }), 'teamId') as Record<any, any> ;
    }else{
        return null
    }
    return res as Record<any, any>;
}