import type {IChampDB, IPlayer, IScorer} from "~/types/interfaces";

export default ((champs: IChampDB[]): IScorer[] => {
   return  champs.map(champ => {

       const res = {
           "champ": {
               "name": champ.name,
               "slug": champ.slug
           },

           "players": champ.scorers?.map((scorer: IPlayer) => {
               return {
                   name: scorer.name,
                   slug: scorer.player?.slug,
                   img: scorer.player?.img,
                   goals: scorer.goals,
                   team: {
                       name: scorer.player?.team?.name || null,
                       sprite: scorer.player?.team?.sprite || null,
                       slug: scorer.player?.team?.slug || null,
                   }
               }
           })
       }
       delete champ.scorers;

       return res as IScorer

   })

})
