
import type {IPost} from "~/types/interfaces";

export default ((posts: IPost[]): Partial<IPost[]> => {

    if(!Array.isArray(posts)){return []}

    return  posts.map(post => {
       return {
           img: post.img,
           title: post.title,
           slug: post.slug,
           champ: post.champ ? {name: post.champ.name, slug: post.champ.slug} : null,
           ecup: post.ecup ? {name: post.ecup.name, slug: post.ecup.slug} : null,
           date: parseInt(post.date as unknown as string)
       }

   }) as Partial<IPost[]>

})
