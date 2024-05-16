import groupBy from "~/helpers/groupBy";
import type {IChampDB, IScore, ITour} from "~/types/interfaces";

export default ((champ: IChampDB): ITour => {

    if (!champ) return {
        champ: {
            name: '',
            slug: ''
        },
        tour: {
            scores: {},
            num: 0
        }
    }

    if (champ?.posts) {
        delete champ.posts;
    }

    champ.tour!.map(tour => {

        const goalsOnly = tour.info?.info?.info.filter((event: { type: string; detail: string; comments: string }) =>
            event.type.toLowerCase() === 'goal'
            && event.detail.toLowerCase() !== 'missed penalty'
            && event.comments?.toLowerCase() !== 'penalty shootout') || null;


        tour.info = null;

        if(Array.isArray(goalsOnly) && goalsOnly.length){
            tour.info = groupBy(goalsOnly.map(goal => {
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
            scores: groupBy(champ.tour as IScore[], 'date'),
            num: champ.current_tour
        }
    }
    delete champ.tour
    return res
})
