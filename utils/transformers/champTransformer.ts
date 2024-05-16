import groupBy from "~/helpers/groupBy";
import type {IChampDB, IScore, ITour} from "~/types/interfaces";

export default ((champs: IChampDB[], source = 'tour'): ITour[] => {
   return  champs.map(champ => {

      // console.log(champ.tour);

       if(source === 'results'){
           champ[source] = champ[source].filter(r => +r.tour < +champ.current_tour)
       }

       champ[source]!.map(tour => {

           let goalsOnly = null;

           /*const goalsOnly = tour.info?.info ?
               tour.info?.info.filter((event: { type: string; detail: string }) => event.type.toLowerCase() === 'goal' && event.detail.toLowerCase() !== 'missed penalty') || null
           : tour.info?.info?.info.filter((event: { type: string; detail: string }) => event.type.toLowerCase() === 'goal' && event.detail.toLowerCase() !== 'missed penalty') || null;*/

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

           if(Array.isArray(goalsOnly) && goalsOnly.length){
              tour.info = groupBy(goalsOnly.map(goal => {
                  goal.teamId = goal.team.id;
                  return goal;
              }), 'teamId');
          }


           return tour;
       })

     //  champ.tour!.info = champ.tour!.info?.info?.info  || null;

       const res = {
           "champ": {
               "name": champ.name,
               "slug": champ.slug
           },
           "tour": {
               "scores": groupBy(champ[source] as IScore[], 'date'),
               "num": champ.current_tour
           }
       }
       delete champ[source]
       return res

   })

})
