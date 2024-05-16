
import type {IPost, ISmallPost} from "~/types/interfaces";

export default ((posts: IPost[]): ISmallPost[] => {

    if(!Array.isArray(posts)){return []}

    return  posts.map(post => {
       return {
           img: /*typeof post.img !== "string" ? {original: post.img.original, thumbnail: post.img.thumbnail}  :*/ post.img,
           title: post.title,
           slug: post.slug,
           champ: post.champ ? {name: post.champ.name, slug: post.champ.slug} : null,
           ecup: post.ecup ? {name: post.ecup.name, slug: post.ecup.slug} : null,
           date: parseInt(post.date as string)
       }

   })

})
