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
            {{data.ecup.name}}
          </TheTitle>
          <TheArchive @resetSeason="refresh" @seasonLoaded="loadSeason" :mode="'ecupStands'"/>
                    <div v-for="(info, group) in data.ecupStands.stands" class="w-full overflow-x-auto">
                    <TheBaseTabInfo :infoToShow="info.teams" :info-type="'ecupTableFullStands'">
                        <thead>
                        <tr>
                            <th class="text-center pl-1 py-[0.7rem] bg-zinc-800 text-zinc-200 px-2">#</th>
                            <th class="text-center pl-1 py-[0.7rem] bg-zinc-800 text-zinc-200 px-2" colspan="2">
                              {{group !== 'null' ? 'Группа '+group : 'Команда'}}
                            </th>
                            <th class="text-center bg-zinc-800 text-zinc-200 px-2">И</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">В</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">Н</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">П</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">З</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">Пр</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">Р</th>
                            <th class="text-center  bg-zinc-800 text-zinc-200 px-2">О</th>
                        </tr>
                        </thead>
                    </TheBaseTabInfo>
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

import type {IEcup, IEcupStand, IPost} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';

const socket = ref<Socket>();
const route = useRoute();

const {data, pending, error, refresh} = await useLazyFetch<{
  ecup: IEcup;
  posts: IPost[];
  ecupStands: IEcupStand;
}>('/api/ecupStands', {params: {ecup: route.params.ecup}, onResponseError({request, response, options}) {
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

const title = computed(()=> 'Новости европейского футбола - Турнирные таблицы - ' + data.value?.ecup?.name)

useSeoMeta({
  title: () => title.value,
});

function loadSeason(res: IEcupStand): void {

  try {

    data.value!.ecupStands = res;

  } catch (e) {

    //console.log(e);

  }
}


onMounted(() => {
  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', 'ecup-stands');

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

})

onBeforeUnmount(() => {
  socket.value?.disconnect();
})

</script>

<style scoped>

</style>