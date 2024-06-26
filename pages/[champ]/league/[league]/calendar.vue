<template>
  <div class="grid md:grid-cols-3 grid-cols-1">
    <div v-if="pending || !data" class="col-span-3 text-center pt-10">
      <div class="min-h-[calc(100vh-240px)] lg:min-h-[calc(100vh-300px)] flex justify-center items-center">
        <div>
          <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
        </div>
      </div>
    </div>
    <template v-else>
      <div class="md:col-span-2 shadow-md shadow-zinc-800/20">
        <TheTitle class="px-3 py-1">
          {{data.league}}
        </TheTitle>
        <TheArchive @resetSeason="resetSeason" @seasonLoaded="loadSeason" :mode="'leagueResults'"/>
        <div class="w-full overflow-x-auto">
          <ClientOnly>
            <TheBaseTabInfo :info-to-show="data.results" :info-type="'fullResults'" />
          </ClientOnly>
        </div>
      </div>
      <div>
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

import type {IPost, IResult} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';

const socket = ref<Socket>();
const route = useRoute();

const {data, pending, error, refresh} = await useLazyFetch<{ league: Record<string, string>; posts: IPost[];
  results: {[index: number]: {[index: number]: Partial<IResult>[]}};

}>('/api/leagueResults', {params: {league: route.params.league, champ: route.params.champ}, onResponseError({request, response, options}) {
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

const title = computed(()=> 'Новости европейского футбола - ' + data.value?.league?.name)

const season = ref<string>('');

provide('season', season);

useSeoMeta({
  title: () => title.value,
});

const titleInfo = computed(()=>{
 return  `${data.value?.league.name}.  ${season.value ? 'Сезон 20'+season.value : ''}`
})

function loadSeason(res: Record<string, any>, seas: string): void {

  try {
    season.value = seas;
    data.value!.results = res;

  } catch (e) {

    //console.log(e);

  }

}

function resetSeason(){
  season.value = ''
  refresh();
}

onMounted(async () => {
  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', 'champ-stands');

  socket.value.on("add-post", (post) => {
    if (route.params.champ && route.params.champ === post.champ?.slug) {
      if(post){
        data.value?.posts.unshift(post);
        if (data.value?.posts) {
          if (data.value.posts.length > 10) {
            data.value.posts.splice(-1, 1);
          }
        }
      }
    }
  });
})

onBeforeUnmount(() => {
  socket.value?.disconnect();
})

</script>

<style scoped>

</style>