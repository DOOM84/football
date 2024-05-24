import groupBy from "~/helpers/groupBy";
import type {IChamp, IResult, ITourResult} from "~/types/interfaces";
type champSrc = 'tour' | 'results' | 'relegation' | 'delay';

export default ((champs: IChamp[], source = 'tour', isRelegation: boolean = false): ITourResult[] => {
   return  champs.map(champ => {

       if(source !== 'tour'){
           if(isRelegation){
               champ[source as champSrc] = champ.results!.filter((r: IResult) => +r.tour === 99);
           }else{
               champ[source as champSrc] = champ.results!.filter((r: IResult) => +r.tour < +champ.current_tour);
           }
       }

       /*if(source === 'results'){
           if(isRelegation){
               champ[source] = champ[source].filter((r: IResult) => +r.tour === 99);
           }else{
               champ[source] = champ[source].filter((r: IResult) => +r.tour < +champ.current_tour);
           }
       }*/

       (champ[source as champSrc] as IResult[]).map((tour: IResult) => {

           let goalsOnly = null;

           if(tour.info?.info?.info){
               goalsOnly = tour.info.info.info.filter((event: { type: string; detail: string; comments: string }) => event.type.toLowerCase() === 'goal'
                   && event.detail.toLowerCase() !== 'missed penalty'
                   && event.comments?.toLowerCase() !== 'penalty shootout'
               )
           }else if(tour.info?.info) {
               goalsOnly =  tour.info?.info.filter((event: { type: string; detail: string; comments: string }) => event.type.toLowerCase() === 'goal'
                   && event.detail.toLowerCase() !== 'missed penalty'
                   && event.comments?.toLowerCase() !== 'penalty shootout'
               )
           }

           tour.info = null;

           if(goalsOnly && Array.isArray(goalsOnly) && goalsOnly.length){
              (tour.info as unknown as Record<number, Record<string, any>[]>) = groupBy(goalsOnly.map(goal => {
                  goal.teamId = goal.team.id;
                  return goal;
              }), 'teamId');
          }

           return tour;
       })

       const res = {
           champ: {
               name: champ.name,
               slug: champ.slug
           },
           tour: {
               scores: groupBy(champ[source as champSrc]!, 'date'),
               num: champ.current_tour
           }
       }
       if(isRelegation) {
           delete champ[source as champSrc];
           delete champ.results;
       }
       return res

   }) as ITourResult[]

})
