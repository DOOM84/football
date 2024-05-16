import groupBy from "~/helpers/groupBy";
import type {IEcupDB, IEcupStands} from "~/types/interfaces";

export default ((ecups: IEcupDB[]): IEcupStands[] => {
   return  ecups.map((ecup: any) => {
        delete ecup.api_id;
        delete ecup.createdAt;
        delete ecup.updatedAt;
        delete ecup.id;
        delete ecup.stage;
        delete ecup.status;

        ecup.stands = groupBy(ecup.stands, 'group') as IEcupStands['stands'];
        for (const group in ecup.stands) {
            const groupStands: IEcupDB['stands'] = [];
            groupStands.push(...ecup.stands[group]/* as unknown as []*/)
            delete ecup.stands[group];
            ecup.stands[group] = {teams: []} as unknown as IEcupStands['stands']
            ecup.stands[group]['teams'] = groupStands.map(team => {
                return {
                    api_id: team.ecupTeam.api_id,
                    name: team.ecupTeam.team?.name || team.ecupTeam.name,
                    slug: !team.ecupTeam.team?.slug ? null : team.ecupTeam.team.slug,
                    sprite: team.ecupTeam.team?.sprite || team.ecupTeam.sprite,
                    group: group,
                    order: team.order,
                    games: team.games,
                    win: team.win,
                    draw: team.draw,
                    lost: team.lost,
                    goals: team.goals,
                    diff: team.diff,
                    missed: team.missed,
                    points: team.points,
                };
            }) as unknown as IEcupStands['stands']['teams']
        }
        return {
            name: ecup.name,
            slug: ecup.slug,
            stands: ecup.stands
        }
    }) as IEcupStands[]
})
