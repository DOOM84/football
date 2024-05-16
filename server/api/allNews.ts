import prisma from '~/helpers/prisma';
import {IPost, ISmallPost} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const postsDb = await prisma.post.findMany({
            where: {
                status: true,
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                ecup: true,
                champ: true
            },
            take: 36
        })

        const posts: ISmallPost[]  = postListTransformer(postsDb as unknown as IPost[]);

        return {posts};

    }catch (e) {
        console.log(e);
    }

})