import {ITeam, ITeamInfo} from "~/types/interfaces";

export default ((team: ITeamInfo): ITeam => {

    return {
        name: team.name,
        slug: team.slug,
        img: team.img,
        team_info: team.team_info,
    }

})
