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
          <TheArchive @resetSeason="refresh" @seasonLoaded="loadSeason" :mode="'leagueStands'"/>
          <div v-if="showStands" class="w-full overflow-x-auto">
            <TheBaseTabInfo :info-to-show="teams" :info-type="'fullStands'" />
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
import type {ILeagueTeam, IPost} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';

const socket = ref<Socket>();
const route = useRoute();

const {data, pending, error, refresh} =  await useLazyFetch<{ teams: ILeagueTeam[];
  posts: IPost[]; league: string;
}>('/api/leagueStands', {params: {league: route.params.league, champ: route.params.champ}, onResponseError({request, response, options}) {
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

const showStands = ref<boolean>(true);

const title = computed(()=> 'Новости европейского футбола - Турнирные таблицы - ' + data.value?.league)

useSeoMeta({
  title: () => title.value,
});

const teams = computed(()=>{
  return data.value!.teams
})

async function loadSeason(res: ILeagueTeam[]) {
  showStands.value = false;
  await new Promise(resolve => setTimeout(resolve, 100));
  data.value!.teams = [...res];
  showStands.value = true;
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