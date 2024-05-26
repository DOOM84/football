<template>
    <div class="grid md:grid-cols-[65%_35%] lg:grid-cols-3 grid-cols-1">
      <div v-if="pending || !data" class="col-span-3 text-center pt-10">
        <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
      </div>
      <template v-else>
        <div class="shadow-md shadow-zinc-800/20 lg:col-span-2">
          <ThePost :post="data.post" />

          <CommentsCWrap v-if="add && del && cCount" @comDeleted="del"
                         @comAdded="add"
                         :sourceId="data.post.id"
                         :commentsCount="cCount"
                         :comments="data.post.comments"
          />

        </div>
        <div>
          <div>
            <TheTabs  :ecup-stands="data.ecupStands" :info-type="'ecupStands'" />
          </div>
          <div class="">
            <TheTabs v-if="data.poResults.length"  :ecupPoResults="data.poResults" :info-type="'ecupPoResults'"/>
          </div>
          <div>
            <TheTabs v-if="Object.keys(data.groupResults).length"  :ecupResults="data.groupResults" :info-type="'ecupResults'"/>
          </div>
          <div class="z-10">
            <ThePostsItem :post="post" v-for="post in data.posts" :key="post.slug"/>
          </div>
          <div class="text-right text-sm py-1 mr-3">
            <nuxt-link to="/news">Все новости</nuxt-link>
          </div>
        </div>
      </template>

    </div>
</template>

<script setup lang="ts">
import type {IComment, IEcup, IEcupResult, IEcupStand, IPost} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';
const socket = ref<Socket>();
const route = useRoute();
const user = useSupabaseUser();
const add = ref<(comment: IComment, flag?: boolean) => void>();
const del = ref<(toDel: number) => void>();
const cCount = ref<number>();

const {data, pending, error} = await useLazyFetch<{
  post: IPost, ecup: IEcup; posts: IPost[];
  groupResults: {[index: string]: {
      [index: number]: {
        [index: number]: Partial<IEcupResult>[]
      }
    }};
  poResults: {
    stage: string,
    scores: {
      [index: number]: Partial<IEcupResult>[]
    }
  }[];
  ecupStands: IEcupStand;
}>('/api/ecupPost', {params: {ecup: route.params.ecup,  slug: route.params.post},
  onResponseError({request, response, options}) {
    showError({
      fatal: true,
      statusCode: 404,
      message: 'Страница не найдена'
    })
  }})

if (error.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    message: 'Страница не найдена'
  })
}

watchEffect(() => {
  if(data.value){
    const {comAdded, comDeleted, comCount} = useComments(data.value?.post.comments);
    add.value = comAdded;
    del.value = comDeleted;
    cCount.value = comCount as unknown as number;
  }
});

//const {comAdded, comDeleted, comCount} = useComments(data.value!.post.comments);

const title = computed(()=> 'Новости европейского футбола - ' + data?.value?.post.title)

useSeoMeta({
  title: () => title.value,
});

provide('setLike', (like: number, comId: number)=>{
  const ind: number = data.value!.post!.comments.findIndex((comment) => comment.id === +comId) as number;
  data.value!.post!.comments[ind]._count.userLikes += like;
})


onMounted(() => {

  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', route.params.post);
  socket.value.emit('joinRoom', 'ecup-post');

  socket.value.on('comment-post', (message) => {
    if(message.userId !== user.value?.id){
      add.value!(message, true);
    }
  })

  socket.value.on("add-post", (post) => {

    if (route.params.ecup && route.params.ecup === post.ecup?.slug) {
      if(post){
        data.value?.posts.unshift(post);
      }
      if (data.value?.posts) {
        if (data.value.posts.length > 10) {
          data.value.posts.splice(-1, 1);
        }
      }
    }

  });

  socket.value.on("update-ecup", (res) => {

    if (route.params.ecup && route.params.ecup === res.ecup) {

      if (data.value) {
        data.value.poResults = res.poResults;
        data.value.groupResults = res.groupResults;
      }
    }

  });

})

onBeforeUnmount(() => {
  // useNuxtApp().$socket.removeAllListeners();
  //socket.value?.removeAllListeners();
  socket.value?.disconnect();

})

//const comCount = computed(() => data.value?.post?.comments?.length || 0);

</script>

<style scoped>

</style>