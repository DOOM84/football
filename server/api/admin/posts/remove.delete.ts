import prisma from '~/helpers/prisma';
import fs from "fs";
import setFilePath from "~/helpers/upload/setFilePath";
const runtimeConfig = useRuntimeConfig();
import algoliasearch from "algoliasearch";
export default defineEventHandler(async (event) => {

        try {
            const {id, path, slug} = await readBody(event);

            const client = algoliasearch(runtimeConfig.algoliaAppId, runtimeConfig.algoliaKey);
            const index = client.initIndex('posts');

            const promisesToExec = Object.values(path as Record<string, string>).map(file => {
                return new Promise(async (resolve, reject) => {
                        try {
                            if (fs.existsSync(setFilePath('/public' + file))) {
                                fs.unlinkSync(setFilePath('/public' + file));
                            }
                            resolve(true);
                        } catch (e) {
                            console.log(e);
                            reject(e)
                        }
                    }
                )
            })

            const updRes = await Promise.all(promisesToExec) as boolean[];

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

            await index.deleteObject(slug);

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
