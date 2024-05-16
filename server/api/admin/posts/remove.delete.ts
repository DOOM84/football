import prisma from '~/helpers/prisma';
import fs from "fs";
import setFilePath from "~/helpers/upload/setFilePath";
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";
export default defineEventHandler(async (event) => {

        try {
            const {id, path} = await readBody(event);

            const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
            const index = client.initIndex('posts');

            const post = await prisma.post.findFirst({
                where: {id}
            })

            if (fs.existsSync(setFilePath('/public' + path.original))) {
                fs.unlinkSync(setFilePath('/public' + path.original));
            }
            if (fs.existsSync(setFilePath('/public' + path.thumbnail))) {
                fs.unlinkSync(setFilePath('/public' + path.thumbnail));
            }

            await prisma.post.update({
                where: {
                    id,
                },
                data: {
                    players: {
                        deleteMany: {},
                    },
                    comments: {
                        deleteMany: {},
                    },
                    teams: {
                        deleteMany: {},
                    },
                    tags: {
                        deleteMany: {},
                    },
                    rates: {
                        deleteMany: {},
                    },
                }
            });

                await prisma.post.delete({
                    where: {
                        id
                    },
                })

            await index.deleteObject(post!.slug);

            return {
                id
            }

        } catch (e) {
            console.log(e);
            throw createError({
                    statusCode: 404,
                    statusMessage: 'Error occurred'
                })
        }
})
