import type {IEcupDB, IEcupStands} from "~/types/interfaces";
import groupBy from "~/helpers/groupBy";

export default ((ecup: any): IEcupStands => {

        delete ecup.posts;

    ecup.stands = groupBy(ecup.stands, 'group') as Record<string | number, any[]>;

        for (const group in ecup.stands) {
            const groupStands: IEcupDB['stands'] = [];
            groupStands.push(...ecup.stands[group] as unknown as [])
            delete ecup.stands[group];
            ecup.stands[group] = {teams: []} as Record<'teams', any[]>
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
            stands: ecup.stands
        }
})