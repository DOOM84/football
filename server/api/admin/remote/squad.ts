import prisma from '~/helpers/prisma';
import {addChampSquad} from "~/helpers/remoteApi";
import slugify from "slugify";
import type {IPlayer} from "~/types/interfaces";

const res: Partial<IPlayer>[] = []
export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

       /* const plrs = await prisma.player.findMany();

        for(let i= 0; i < plrs.length; i++){
            await prisma.player.update({
                where: {
                    api_id: +plrs[i].api_id,
                },
                data: {slug: await getPlayerSlug(plrs[i].slug, +plrs[i].api_id, 0)}
            });
        }*/

        const query= getQuery(event);

        const players = await addChampSquad(+query.champApiId! /*, +query.teamId!*/) as Record<string, any>[];

        const teams = await prisma.team.findMany({
            select: {id: true, api_id: true}
        });

        const countries = await prisma.country.findMany();

        for(let i= 0; i < players.length; i++){

            /*const team = await prisma.team.findFirst({
                where: {
                    api_id: players[i].statistics[0].team.id,
                },
            })*/

            const team = teams.filter(team => +team.api_id === +players[i].statistics[0].team.id)[0]

            /*const country_id = await prisma.country.findFirst({
                where: {
                    parse_name: players[i].player.nationality,
                },
            })*/

            const country_id = countries.filter(country => country.parse_name === players[i].player.nationality)[0]

            const pl = {
                api_id: players[i].player?.id || 99999999,
                name: players[i].player.name,
                img: players[i].player.photo,
                team_id: team?.id || 99999999,
                country_id: country_id?.id || null,
                position_id: players[i].statistics[0].games.position.toLowerCase() === 'goalkeeper' ? 1 :
                    players[i].statistics[0].games.position.toLowerCase() === 'defender' ? 2 :
                        players[i].statistics[0].games.position.toLowerCase() === 'midfielder' ? 3 : 4,
                slug: slugify(players[i].player.name as string, {strict: true, lower:true}),
                info: {
                    name: players[i].player.name,
                    birth: players[i].player.birth?.date,
                    photo: players[i].player.photo,
                    height: players[i].player.height,
                    weight: players[i].player.weight,
                    lastname: players[i].player.lastname,
                    nationality: players[i].player.nationality,
                    position_id: players[i].statistics[0].games.position.toLowerCase() === 'goalkeeper' ? 1 :
                        players[i].statistics[0].games.position.toLowerCase() === 'defender' ? 2 :
                            players[i].statistics[0].games.position.toLowerCase() === 'midfielder' ? 3 : 4,
                }
            }

            res.push({...pl})

            await prisma.player.upsert({
                where: { api_id: +pl.api_id },
                update: {...pl, slug: await getPlayerSlug(pl.slug, pl.api_id, 0)},
                create: {...pl, slug: await getPlayerSlug(pl.slug, pl.api_id, 0)},
            })
        }

        return {players: res}

    }catch (e) {
        console.log(e);
    }

})

async function getPlayerSlug(playerSlug: string, playerApiId: number, flag: number): Promise<string>{

    const player = await prisma.player.findFirst({
        where: {
            slug: playerSlug,
            NOT: {
                api_id: +playerApiId,
            },
        },
    })

    if(player?.id){
        flag += 1;
        const newPlayerSlug = playerSlug+'-'+flag;
        return await getPlayerSlug(newPlayerSlug, playerApiId, flag)
    }

    return playerSlug;
}