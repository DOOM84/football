import type {IPost, IComment} from "~/types/interfaces";
export default ((post: Partial<IPost>): Partial<IPost>=> {

    return {
        id: post.id,
        rate: post.rates!.length ?
            +(post.rates!.map(r => r.rate).reduce((total, amount) => total + amount)/post.rates!.length).toFixed(1)
            : 0,
        body: post.body,
        title: post.title,
        subtitle: post.subtitle,
        date: post.date,
        img: /*typeof post.img !== "string" ? post.img?.original :*/  post.img,
        source: post.source,
        comments: [
            ...post.comments.map(c => {
                const res =  {...c,
                    _count: {
                        userLikes: c.userLikes!.reduce((acc, curr) => acc + curr.like, 0)
                    }
                }
                delete (res as unknown as IComment).userLikes
                return res
            }) as IComment[],
        ],
        players: post.players?.map(player=> {
            return {
                name: player.player.name,
                slug: player.player.slug,
                img: player.player.img,
            }
        }),
        teams: post.teams?.map(team=> {
            return {
                name: team.team.name,
                slug: team.team.slug,
                sprite: team.team.sprite,
            }
        }),
        tags: post.tags?.map(tag=> {
            return {
                name: tag.tag.name,
                slug: tag.tag.slug,
            }
        })

    }

})
