<template>
    <div>
      <div v-if="pending || !data" class="col-span-3 text-center pt-10">
        <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
      </div>
      <template v-else>
        <div class="p-4">Все новости</div>
        <div class="px-1 mt-4 flex flex-wrap text-center justify-center gap-4 ">
            <ThePostsCard :post="post" :m-width="+280" v-for="post in data.posts" :key="post.slug"/>
        </div>

        <div class="p-4 mt-3">
          <TheLoadMore @addPosts="addPosts" :limit="5" :count="data.posts.length" :my="0" />
        </div>


      </template>
    </div>

</template>

<script setup lang="ts">
import type {IPost} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';
const socket = ref<Socket>();

const {data, pending} = await useLazyFetch<{ posts: IPost[]}>('/api/allNews');


useHead({
  titleTemplate: '%s - Все новости'
})

onMounted(() => {

  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', 'news');

  socket.value.on('add-post', (post) => {
    if (post) {
      data.value?.posts.unshift(post);
    }
  })

})

onBeforeUnmount(() => {
  // useNuxtApp().$socket.removeAllListeners();
  socket.value?.disconnect();
})

function addPosts(loadedPosts: IPost[]): void {
  data.value?.posts.push(...loadedPosts)
}
</script>

<style scoped>

</style>