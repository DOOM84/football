import groupBy from "~/helpers/groupBy";
import type {IResult} from "~/types/interfaces";

export default ((results: IResult[]): {[index: number]: {[index: number]: Partial<IResult>[]}} => {

    const groupedByTour: {[index: IResult['tour']]: IResult[]} = groupBy(results, 'tour');

    for (const tour in groupedByTour) {
        (groupedByTour[tour] as unknown as {[index: IResult['date']]: IResult[]}) = groupBy(groupedByTour[tour], 'date') as {[index: IResult['date']]: IResult[]};

        for (const date in groupedByTour[tour]) {
            (groupedByTour[tour][date] as unknown as Partial<IResult>[]) = (groupedByTour[tour][date] as unknown as IResult[]).map((res) => {
                return {
                    away: res.away,
                    date: res.date,
                    home: res.home,
                    stamp: res.stamp,
                    tour: res.tour,
                    api_id: res.api_id,
                    is_info: res.is_info,
                    time: res.time,
                    res1: res.res1,
                    res2: res.res2,
                    champ: res.champ,
                }
            }) as unknown as Partial<IResult>[]
        }
    }
    return groupedByTour as unknown as {[index: number]: {[index: number]: Partial<IResult>[]}} ;

})


