import type {IError, IUser} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
import algoliasearch from "algoliasearch";
const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {

        try {
            // @ts-ignore: Unreachable code error
            BigInt.prototype.toJSON = function (): string {
                return this.toString();
            };

            const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
            const index = client.initIndex('players');
            await index.clearObjects();
            const players = await prisma.player.findMany({
                include: {
                    team: {select: {name: true, sprite: true, slug: true}}
                }
            });

            for (let i = 0; i < players.length; i++) {
                players[i] = {
                    img: players[i].img,
                    name: players[i].name,
                    slug: players[i].slug,
                    team: players[i].team,
                    objectID: players[i].slug,
                    position_id: players[i].position_id,
                } as any
            }

            await index.saveObjects(players);


            return {res: true};

        } catch (e) {

            console.log(e);

            const typedError = e as IError;

            if (typedError.path && typedError.errors?.length) {
                throw createError({
                    statusCode: 422,
                    message: typedError.errors[0]
                })
            } else {
                throw createError({
                    statusCode: 404,
                    message: 'Error occurred'
                })
            }
        }
})
