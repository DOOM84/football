import prisma from '~/helpers/prisma';
import {addPlayerInfo} from "~/helpers/remoteApi";
import type {ICountry} from "~/types/interfaces";
export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

       const player = await addPlayerInfo(+query.teamApiId!, +query.playerApiId!) as Record<string, any>;

       if(!player) {throw new Error()}

        const country_id = await prisma.country.findFirst({
            where: {
                parse_name: player.nationality,
            },
        }) as unknown as ICountry;

        const info = {
                name: player.name,
                birth: player.birth?.date,
                photo: player.photo,
                height: player.height,
                weight: player.weight,
                lastname: player.lastname,
                nationality: player.nationality,
        }

        await prisma.player.update({
            where: { api_id: +query.playerApiId! },
            data: {country_id: country_id?.id || null, info}
        })

        return {player}

    }catch (e) {
        console.log(e);
    }

})