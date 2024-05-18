import prisma from '~/helpers/prisma';

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const posts = await prisma.post.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                ecup: {select: {slug: true, name: true, id: true}},
                champ: {select: {slug: true, name: true, id: true}},
                players: {include: {
                        player: {select: {slug: true, img: true, name: true, id: true}}
                    }},
                tags: {include: {
                        tag: {select: {slug: true, name: true, id: true}}
                    }},
                teams: {include: {
                        team: {select: {name: true, slug: true, sprite: true, img:true, id: true}}
                    }},
            },
            //take: 5
        })

        const champs = await prisma.champ.findMany({
            select: {slug: true, name: true, id: true},
            orderBy: {
                id: 'asc',
            },
        });
        const tags = await prisma.tag.findMany({
            select: {slug: true, name: true, id: true},
            orderBy: {
                name: 'asc',
            },
        });

        const teams = await prisma.team.findMany({
            orderBy: {
                champ_id: 'asc',
            },
            select: {name: true, slug: true, sprite: true, img: true, id: true}
        });

        const ecups = await prisma.ecup.findMany({
            select: {slug: true, name: true, id: true},
            where: {
                status: true,
            },
            orderBy: {
                id: 'asc',
            },
        });

        return {posts: posts.map(post => ({...post,
                tags: post.tags.map(t => t.tag),
                teams: post.teams.map(t => t.team),
                players: post.players.map(t => t.player),
            })), champs, ecups, tags, teams, players: []};

    }catch (e) {
        console.log(e);
    }

})