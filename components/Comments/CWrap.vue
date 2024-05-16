<template>
  <div class="mt-8 px-3">
    <h2 class="text-2xl font-bold sm-heading mt-1">
      Комментарии: {{commentsCount}}
    </h2>
    <div v-for="comment in comments" class="comments-container">
      <CommentsCItem @delCom="delCom" @quoting="quoting" :comment="comment"/>
    </div>

    <h2 class="text-2xl font-bold sm-heading mt-5">
      Оставить комментарий
    </h2>
    <transition name="quote">
      <div v-if="quote" class="quote">
        <p>
          <em>{{ quote.user.login }} ({{ $showDate(+quote.stamp) }}):</em>
        </p>
        <p>
          "{{ quote.body }}"
        </p>
        <div class="quoteClose">
          <Icon @click="quote=null" name="ic:round-close" class="cursor-pointer" size="20px"/>
        </div>
      </div>
    </transition>

    <textarea v-model.trim="commentBody" class="input" id="commentForm" cols="30" rows="6"
              placeholder="Комментарий"></textarea>

    <div class="text-right mb-5">
      <button @click="comment" class="btn font-bold">Отправить</button>
    </div>
  </div>

</template>

<script lang="ts" setup>
import type {IComment, IError, IUser,} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client'
const {$toast, $showDate, $scrollTo} = useNuxtApp();
const route = useRoute();
const user = useSupabaseUser();
const {auth} = useSupabaseClient();

const props = defineProps<{
  comments: IComment[];
  commentsCount: any;
  sourceId: number;
}>()


const socket = ref<Socket>();

const emit = defineEmits(['comDeleted', 'comAdded'])

const commentBody = ref('');
const quote = ref<IComment['quote'] | null>(null);

async function delCom(id: number) {

  try {

    const {data, error} = await auth.getSession();

    if(error){throw error}

    if (!user.value || !data?.session || !data.session?.user.app_metadata.admin) {
      $toast.error('Ошибка! Вы не авторизованы');
      return
    }

    $toast.info('Отправка...');

    const {toDel} = await $fetch<{ toDel: number }>('/api/admin/comdel', {
      method: 'DELETE',
      body: {id},
    })
    emit('comDeleted', +toDel);

  } catch (e) {

    const typedError = e as IError;

    if (typedError.response?.status === 401) {
      $toast.error('Ошибка! Вы не авторизованы');
    } else if (typedError.response?.status === 403) {
      $toast.error('Доступ запрещен');
    } else {
      $toast.error('Произошла ошибка. Попробуйе позже.');
    }

  }
}

function quoting(comment: IComment): void {
  quote.value = {
    body: comment.body.substring(0, 200) + '...',
    stamp: +comment.stamp,
    user: {login: comment.user!.login}
  }

  $scrollTo('#commentForm', 800, {offset: -100})
}

async function comment(): Promise<void> {

  try {

    const {data} = await auth.getUser();

    if(!data.user){
      const error = new Error() as IError;
      error.status = 400
      throw error;
    }

    if (!user.value || !data.user) {
      $toast.error('Ошибка! Вы не авторизованы');
      return
    }

    if((data.user as unknown as IUser).banned_until){
      if(Date.parse((data.user as unknown as IUser).banned_until as string) - Date.now() > 0){
        await auth.signOut();
        $toast.error('Ошибка! Вы не авторизованы');
        return
      }
    }

    if (!commentBody.value || commentBody.value.indexOf('\n\n\n') > 0) {
      $toast.error('Введите текст, либо отформатируйте его без лишних переносов строк');
      return
    }
    if (commentBody.value.length > 8000) {
      $toast.error('Содержимое Вашего комментария больше 8000 знаков');
      return
    }

    const info: {
      post_id: number,
      body: string,
      user_id: string,
      quote?: string
    } = {
      post_id: props.sourceId!,
      body: commentBody.value,
      user_id: user.value.id}

    if (quote.value) {
      info.quote = JSON.stringify(quote.value)
    }

    $toast.info('Отправка...');
    const {newComment} = await $fetch<{newComment: IComment}>('/api/auth/comment', {
      method: 'POST',
      body: {
        info,
        post: route.params.post
      },
    })

    socket.value?.emit( 'comment',
        {
          newComment: {...newComment, userId: user.value.id},
          room: route.params.post
        }
    );

    emit('comAdded', newComment);

    commentBody.value = '';
    quote.value = null;
  } catch (e) {

    const typedError = e as IError;

    if(typedError.status === 400){
      await auth.signOut();
      $toast.error('Ошибка! Вы не авторизованы');
    }else if (typedError.response?.status === 422) {
      $toast.error(typedError.response?._data?.message as string);

    } else if (typedError.response?.status === 401) {
      $toast.error('Ошибка! Вы не авторизованы');
    } else {
      $toast.error('Что-то пошло не так... Попробуйте позже');
    }

  }
}

onMounted(() => {
  socket.value = io({
    path: '/api/socket.io'
  })

});

onBeforeUnmount(() => {
  socket.value?.disconnect();
})



</script>

<style lang="scss" scoped>
.comments-container {
  width: 100%;
  margin-top: 2rem;
}

.quote {
  text-align: left;
  background: #327135;
  color: #FFFFFF;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.quoteClose {
  position: absolute;
  top: 0;
  right: 5px;
}

.quote-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.quote-enter-active {
  transition: all 1.5s;
}

.quote-leave-active {
  transition: all 1.5s;
}

.quote-enter {
  opacity: 0;
}

.quote-leave-to {
  opacity: 0;
}

.sm-heading {
  margin-bottom: 1rem;
  padding: 0.2rem 1rem;
  //background: rgba(73, 73, 73, 0.5);
}

.input {
  outline: none;
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid black;
  color: black;
  transition: all 0.5s ease-out;

  &:focus {
    background: #fff;
    color: #000;

    &::placeholder {
      color: transparent;
      transition: all 0.5s ease-out;
    }
  }
}

textarea {
  resize: none;
}

</style>