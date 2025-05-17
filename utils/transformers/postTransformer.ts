import type {IPost, IComment, IPlayer, ITeam, ITag} from "~/types/interfaces";
export default ((post: IPost): Partial<IPost>=> {

    return {
        id: post.id,
        rate: post.rates!.length ?
            +(post.rates!.map(r => r.rate).reduce((total, amount) => total + amount)/post.rates!.length).toFixed(1)
            : 0,
        body: post.body,
        title: post.title,
        subtitle: post.subtitle,
        date: post.date,
        img: post.img,
        source: post.source,
        comments: [
            ...post.comments!.map(c => {
                const res =  {...c,
                    _count: {
                        userLikes: c.userLikes!.reduce((acc, curr) => acc + curr.like, 0)
                    }
                }
                delete res.userLikes
                return res;
            }) as IComment[],
        ],
        players: post.players?.map(player=> {
            return {
                name: player.name,
                slug: player.slug,
                img: player.img,
            }
        }) as IPlayer[],
        teams: post.teams?.map(team=> {
            return {
                name: team.name,
                slug: team.slug,
                sprite: team.sprite,
            }
        }) as ITeam[],
        tags: post.tags?.map(tag=> {
            return {
                name: tag.name,
                slug: tag.slug,
            }
        }) as ITag[]
    }
})
