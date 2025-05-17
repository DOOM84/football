import groupBy from "~/helpers/groupBy";

export default function (info:  any[] | null): Record<any, any[]> | null {

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
        }), 'teamId') as Record<any, any[]> ;
    }else{
        return null;
    }
    return res;
}


