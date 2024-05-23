import type {IChamp, IScorer} from "~/types/interfaces";

export default ((champ: Partial<IChamp>): IScorer | Partial<IScorer> => {

    if(!champ){return {players: []}}

    const res = {
           champ: {
               name: champ.name,
               slug: champ.slug
           },

           players: champ.scorers?.map((scorer) => {
               return {
                   name: scorer.name,
                   slug: scorer.player?.slug,
                   img: scorer.player?.img,
                   goals: scorer.goals,
                   team: {
                       name: scorer.player.team.name,
                       sprite: scorer.player.team.sprite,
                       slug: scorer.player.team.slug,
                   }
               }
           })
       }
       delete champ.scorers;

       return res as unknown as IScorer

})
