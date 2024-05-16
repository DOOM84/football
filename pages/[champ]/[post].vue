<template>
  <div class="grid md:grid-cols-[65%_35%] lg:grid-cols-3 grid-cols-1">
    <div v-if="pending || !data" class="col-span-3 text-center pt-10">
      <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
    </div>
    <template v-else>
      <div class="shadow-md shadow-zinc-800/20 lg:col-span-2">
        <ThePost :post="data.post"/>

        <ClientOnly>
          <CommentsCWrap v-if="add && del && cCount" @comDeleted="del"
                         @comAdded="add"
                         :sourceId="data.post.id"
                         :commentsCount="cCount"
                         :comments="data.post.comments"
          />
        </ClientOnly>

      </div>
      <div>
        <div>
          <ClientOnly>
            <div v-if="data && data.delayResults && data.delayResults.length" class="overflow-x-auto">
              <div class="bg-blue-50">Перенесенный матч</div>
              <TheBaseTabInfo v-if="data && data.delayResults[0]" :info-to-show="data.delayResults[0]"
                              :info-type="'shortResults'"/>
            </div>
          <TheBaseTabInfo v-if="data && data.tourResults" :info-to-show="data.tourResults" :info-type="'shortResults'"/>
          </ClientOnly>
        </div>
        <div>
          <TheBaseTabInfo v-if="data && data.champ"
                          :info-to-show="data.champ.teams.filter(t => t.hasOwnProperty('status') && t.status)"
                          :info-type="'shortStands'"/>
        </div>
        <div class="z-10">
          <ThePostsItem v-if="data && data.posts" :post="post" v-for="post in data.posts" :key="post.slug"/>
        </div>
        <div class="text-right text-sm py-1 mr-3">
          <nuxt-link to="/news">Все новости</nuxt-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {IChampDB, IComment, IPost, ISmallPost, ITour} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';
const socket = ref<Socket>();
const route = useRoute();
const user = useSupabaseUser();
const add = ref<(comment: IComment, flag?: boolean) => void>();
const del = ref<(toDel: number) => void>();
const cCount = ref<number>();

const {data, pending, error} = await useLazyFetch<{
  post: IPost, champ: IChampDB,
  tourResults: ITour, posts: ISmallPost[],
}>('/api/post', {
  params: {champ: route.params.champ, slug: route.params.post}, onResponseError({request, response, options}) {
    showError({
      fatal: true,
      statusCode: 404,
      message: 'Страница не найдена'
    })
  },
})

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

const title = computed(()=> 'Новости европейского футбола - ' + data?.value?.post.title)

useSeoMeta({
  title: () => title.value,
});

provide('setLike', (like: number, comId: number)=>{
  const ind: number = data.value!.post!.comments.findIndex((comment) => comment.id === +comId) as number;
  data.value!.post!.comments[ind]._count.userLikes += like;
})

async function refreshInfo() {
  try {

    const {tourResults}  = await $fetch<{tourResults: ITour}>('/api/liveResults', {
      params: {champ: route.params.champ},
    });

    data.value!.tourResults = tourResults;

  } catch (e) {
    console.log(e);
  }

}

onMounted(async () => {

  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', route.params.post);
  socket.value.emit('joinRoom', 'champ-post');

  socket.value.on('comment-post', (message) => {
    if(message.userId !== user.value?.id){
      add.value!(message, true);
    }
  })

  socket.value.on("add-post", (post) => {
        if (route.params.champ && route.params.champ === post.champ?.slug) {
          if (post) {
            data.value?.posts.unshift(post);
            if (data.value?.posts) {
              if (data.value.posts.length > 10) {
                data.value.posts.splice(-1, 1);
              }
            }
          }
        }
      });

  socket.value.on("results-live", async () => {
    await refreshInfo();
  })
})

onBeforeUnmount(() => {
  socket.value?.disconnect();
})

//const comCount = computed(() => data.value?.post?.comments?.length || 0);

</script>

<style scoped>

</style>