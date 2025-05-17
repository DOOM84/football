import type {IComment} from "~/types/interfaces";


export const useComments = (comments: IComment[]) => {

    function comAdded(comment: IComment, flag: boolean = false): void {
        if(!Array.isArray(comments)){
            comments = [];
        }
        comments.push(comment);
        if(!flag){
            useNuxtApp().$toast.success('Ваш комментарий успешно добавлен');
        }
    }

   function comDeleted(toDel: number): void {
       if(!Array.isArray(comments)){
           return
       }
       comments.splice(comments.findIndex(item => item.id === toDel), 1);
       useNuxtApp().$toast.success('Комментарий успешно удален');
    }

    const comCount = computed<number>(() => comments?.length || 0);

    return {
        comAdded,
        comDeleted,
        comCount
    }
}

