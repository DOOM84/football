import groupBy from "~/helpers/groupBy";
import type {IEcup, IEcupStand} from "~/types/interfaces";
type ecStands = {[index: IEcup['stands'][0]['group']] : IEcup['stands']};

export default ((ecups: IEcup[]): IEcupStand[] => {
   return  ecups.map((ecup: Partial<IEcup>) => {
        /*delete ecup.api_id;
        delete ecup.createdAt;
        delete ecup.updatedAt;
        delete ecup.id;
        delete ecup.stage;
        delete ecup.status;*/

        (ecup.stands as unknown as ecStands) = groupBy(ecup.stands!, 'group');

        for (const group  in ecup.stands) {
            const groupStands = [];
            groupStands.push(...(ecup.stands as unknown as ecStands)[group])
            delete (ecup.stands as unknown as ecStands)[group];
            ((ecup.stands as unknown as ecStands)[group] as unknown as Record<'teams', []>) = {teams: []};
             ((ecup.stands as unknown as ecStands)[group] as unknown as IEcupStand['stands'])['teams'] = groupStands.map(team => {
                return {
                    //api_id: team.ecupTeam.api_id,
                    name: team.ecupTeam.team?.name || team.ecupTeam.name,
                    slug: !team.ecupTeam.team?.slug ? null : team.ecupTeam.team.slug,
                    sprite: team.ecupTeam.team?.sprite || team.ecupTeam.sprite,
                    group: group,
                    order: team.order,
                    games: team.games,
                    /*win: team.win,
                    draw: team.draw,
                    lost: team.lost,
                    goals: team.goals,
                    diff: team.diff,
                    missed: team.missed,*/
                    points: team.points,
                };
            }) as unknown as IEcupStand['stands']['teams']
        }
        return {
            name: ecup.name,
            slug: ecup.slug,
            stands: ecup.stands
        }
    }) as unknown as IEcupStand[]
})
