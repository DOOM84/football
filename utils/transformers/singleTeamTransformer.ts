import type {ITeam} from "~/types/interfaces";

export default ((team: ITeam): Partial<ITeam> => {

    return {
        name: team.name,
        slug: team.slug,
        img: team.img,
        team_info: team.team_info,
    }

})
