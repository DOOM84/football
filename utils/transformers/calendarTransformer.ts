import groupBy from "~/helpers/groupBy";
import type {IScore} from "~/types/interfaces";
import {result} from "~/types/types";

export default ((results: IScore[]): result => {

    const groupedByTour: Record<string | number, Record<string | number, IScore[]>> = groupBy(results, 'tour');

    for (const tour in groupedByTour) {
        groupedByTour[tour] = groupBy(groupedByTour[tour] as unknown as IScore[], 'date');

        for (const date in groupedByTour[tour]) {
            groupedByTour[tour][date] = groupedByTour[tour][date].map((res: IScore) => {
                return {
                    away: res.away,
                    date: res.date,
                    home: res.home,
                    stamp: res.stamp,
                    tour: res.tour,
                    api_id: res.api_id,
                    is_info: res.is_info,
                    info: getGoals(res.info?.info || null),
                    time: res.time,
                    res1: res.res1,
                    res2: res.res2,
                    champ: res.champ,
                }
            })
        }
    }
    return groupedByTour;

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
