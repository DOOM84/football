<template>
  <div class="grid lg:grid-cols-3 grid-cols-1">
    <div v-if="pending || !data" class="col-span-3 text-center pt-10">
      <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
    </div>
    <template v-else>
      <div class="lg:col-span-2">
        <div class="text-center" v-if="data && data.headLines">
          <ClientOnly>
            <TheSlides :headlines="data.headLines"/>
          </ClientOnly>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-[45%_55%] ">
          <div class="order-last sm:order-first">
            <TheBaseTabInfo v-if="data && data.champ" :info-to-show="data.champ.teams" :info-type="'shortStands'"/>
            <div class="lg:hidden">
              <div>
                <ClientOnly>
                  <div v-if="data && data.delayResults && data.delayResults.length" class="overflow-x-auto">
                    <div class="bg-blue-50">Перенесенный матч</div>
                    <TheBaseTabInfo v-if="data && data.delayResults[0]" :info-to-show="data.delayResults[0]"
                                    :info-type="'shortResults'"/>
                  </div>
                <TheBaseTabInfo v-if="data && data.tourResults" :info-to-show="data.tourResults"
                                :info-type="'shortResults'"/>
                </ClientOnly>
              </div>
              <div>
                <TheBaseTabInfo v-if="data && data.players" :info-to-show="data.players" :info-type="'scorers'">
                  <thead>
                  <tr>
                    <th class="text-left pl-1 py-[0.7rem] bg-zinc-100" colspan="2">Игрок</th>
                    <th class="text-center py-[0.7rem] bg-zinc-100">Голы</th>
                  </tr>
                  </thead>
                </TheBaseTabInfo>
              </div>
            </div>
          </div>
          <div class="shadow-md shadow-zinc-800/20 z-10">
            <template v-if="data && data.posts">
              <ThePostsItem v-if="data && data.posts" :post="post" v-for="post in data.posts" :key="post.slug"/>
              <TheLoadMore v-if="data && data.champ" @addPosts="addPosts" :limit="5" :champ-id="data.champ.id"
                           :count="data.posts.length"/>
            </template>
            <div class="text-right text-sm py-1 mr-3">
              <nuxt-link to="/news">Все новости</nuxt-link>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="hidden lg:block">
          <div class="">
            <ClientOnly>
              <div v-if="data && data.delayResults && data.delayResults.length" class="overflow-x-auto">
                <div class="bg-blue-50">Перенесенный матч</div>
                <TheBaseTabInfo v-if="data && data.delayResults[0]" :info-to-show="data.delayResults[0]"
                                :info-type="'shortResults'"/>
              </div>
            <TheBaseTabInfo v-if="data && data.tourResults" :info-to-show="data.tourResults"
                            :info-type="'shortResults'"/>
            </ClientOnly>
          </div>
          <div class="">
            <TheBaseTabInfo v-if="data && data.players" :info-to-show="data.players" :info-type="'scorers'">
              <thead>
              <tr>
                <th class="text-left pl-1 py-[0.7rem] bg-zinc-100" colspan="2">Игрок</th>
                <th class="text-center py-[0.7rem] bg-zinc-100">Голы</th>
              </tr>
              </thead>
            </TheBaseTabInfo>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import type {IChamp, IScorer, IPost, ITourResult} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';

const socket = ref<Socket>();

const route = useRoute();

const {data, pending, error} = await useLazyFetch<{
  champ: IChamp, delayResults: ITourResult[],
  tourResults: ITourResult, posts: IPost[], headLines: IPost[], players: IScorer
}>('/api/champ', {
  params: {champ: route.params.champ, count: 35}, onResponseError({request, response, options}) {
    showError({
      fatal: true,
      statusCode: 404,
      message: 'Страница не найдена'
    })
  }
})

const title = computed(()=> 'Новости европейского футбола - ' + data?.value?.champ.name)

useSeoMeta({
  title: () => title.value,
});

if (error.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    message: 'Страница не найдена'
  })
}

async function refreshInfo() {
  try {

    const {tourResults}  = await $fetch<{tourResults: ITourResult}>('/api/liveResults', {
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
  });

  socket.value.emit('joinRoom', 'champ');

  socket.value.on("add-post", (post) => {
    if (route.params.champ && route.params.champ === post.champ?.slug) {
      if (post) {
        data.value?.posts.unshift(post);
      }
    }
  });

  socket.value.on("results-live", async () => {
    await refreshInfo();
  })

  socket.value.on("update-tour", (results) => {

    if (data.value?.champ.slug === results.champ.slug) {
      if (data.value?.tourResults) {
        data.value.tourResults = {...results};
      }
    }

  });

})

onBeforeUnmount(() => {
  socket.value?.disconnect();
})

function addPosts(loadedPosts: IPost[]): void {
  data.value?.posts.push(...loadedPosts)
}

</script>

<style scoped>

</style>