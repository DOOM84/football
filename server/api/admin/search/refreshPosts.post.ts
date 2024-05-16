import type {IError, IPost, IUser} from "~/types/interfaces";
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
            const index = client.initIndex('posts');
            await index.clearObjects();
            const posts = await prisma.post.findMany();

            for (let i = 0; i < posts.length; i++) {
                const champ = await prisma.champ.findFirst({
                    where: {
                        id: +posts[i].champ_id!
                    }
                })
                const ecup = await prisma.ecup.findFirst({
                    where: {
                        id: +posts[i].ecup_id!
                    }
                })
                posts[i] = {
                    img: posts[i].img,
                    title: posts[i].title,
                    slug: posts[i].slug,
                    subtitle: posts[i].subtitle,
                    body: posts[i].body,
                    date: posts[i].date,
                    status: posts[i].status,
                    champ: champ ? {name: champ.name, slug: champ.slug} : null,
                    ecup: ecup ? {name: ecup.name, slug: ecup.slug} : null,
                    objectID: posts[i].slug,
                } as any;
            }

            await index.saveObjects(posts);


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
