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
          <div class="order-last sm:order-first overflow-x-auto">
            <TheTabs v-if="data && data.champs" :champs="data.champs" :info-type="'shortStands'"/>
            <div class="lg:hidden">
              <div v-if="data && data.delayResults && data.delayResults.length" class="overflow-x-auto">
                <div class="bg-blue-50">Перенесенный матч</div>
                <TheTabs  :tourResults="data.delayResults" :info-type="'shortResults'"/>
              </div>
              <div class="overflow-x-auto">
                <TheTabs v-if="data && data.tourResults"
                         :tourResults="data.tourResults" :info-type="'shortResults'"/>
              </div>
              <div class="overflow-x-auto">
                <TheTabs v-if="data && data.players" :scorers="data.players" :info-type="'scorers'">
                  <thead>
                  <tr>
                    <th class="text-left pl-1 py-[0.7rem] bg-zinc-100" colspan="2">Игрок</th>
                    <th class="text-center py-[0.7rem] bg-zinc-100">Голы</th>
                  </tr>
                  </thead>
                </TheTabs>
              </div>
              <div class="overflow-x-auto">
                <template v-if="data && data.ecupStands" :key="ecup.slug" v-for="ecup in data.ecupStands">
                  <div class="w-full text-left bg-zinc-100">
                    {{ ecup.name }}
                  </div>
                  <TheTabs v-if="Object.keys(ecup?.stands).length" :ecup-stands="ecup" :info-type="'ecupStands'"/>
                </template>
              </div>
            </div>
          </div>
          <div class="shadow-md shadow-zinc-800/20 z-10">
            <template v-if="data && data.posts">
              <ThePostsItem :post="post" v-for="post in data.posts" :key="post.slug"/>
              <TheLoadMore @addPosts="addPosts" :limit="5" :count="data.posts.length"/>
            </template>

            <div class="text-right text-sm py-1 mr-3">
              <nuxt-link to="/news">Все новости</nuxt-link>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="hidden lg:block">
          <div v-if="data && data.delayResults && data.delayResults.length" class="overflow-x-auto">
            <div class="bg-blue-50">Перенесенный матч</div>
            <TheTabs  :tourResults="data.delayResults" :info-type="'shortResults'"/>
          </div>
          <div class="overflow-x-auto">
            <TheTabs v-if="data && data.tourResults"
                     :tourResults="data.tourResults" :info-type="'shortResults'"/>
          </div>
          <div class="overflow-x-auto">
            <TheTabs v-if="data && data.players" :scorers="data.players" :info-type="'scorers'">
              <thead>
              <tr>
                <th class="text-left pl-1 py-[0.7rem] bg-zinc-100" colspan="2">Игрок</th>
                <th class="text-center py-[0.7rem] bg-zinc-100">Голы</th>
              </tr>
              </thead>
            </TheTabs>
          </div>
          <div class="overflow-x-auto">
            <template v-if="data && data.ecupStands" :key="ecup.slug+i" v-for="(ecup, i) in data.ecupStands">
              <div class="w-full text-left bg-zinc-100">
                {{ ecup.name }}
              </div>
              <TheTabs v-if="Object.keys(ecup?.stands).length" :ecup-stands="ecup" :info-type="'ecupStands'"/>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {IChampDB, IEcupStands, IScorer, ISmallPost, ITour} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';
const socket = ref<Socket>();

const {data, pending} = await useLazyFetch<{
  champs: IChampDB[],
  tourResults: ITour[], delayResults: ITour[], ecupStands: IEcupStands[], posts: ISmallPost[], headLines: ISmallPost[], players: IScorer[]
}>('/api/main')

async function refreshInfo() {
  try {
    const {tourResults, delayResults} = await $fetch<{tourResults: ITour[], delayResults: ITour[]}>('/api/liveResults');
    data.value!.tourResults = tourResults as ITour[];
    data.value!.delayResults = delayResults as ITour[];
  } catch (e) {
    console.log(e);
  }

}

onMounted(async () => {

  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', 'main');

  socket.value.on('add-post', (post) => {
    if (post) {
      data.value?.posts.unshift(post);
    }
  })

  socket.value.on("update-tour", (results) => {

    if (data.value?.tourResults) {
      const ind: number = data.value.tourResults.findIndex(tr => tr.champ.slug === results.champ.slug);
      if (ind > -1) {
        data.value.tourResults[ind] = {...results};
      }
    }
  });

  socket.value.on("results-live", async () => {
    await refreshInfo()
  })

  /*useNuxtApp().$socket.on("add-post", (post) => {

    if (post) {
      data.value?.posts.unshift(post);
    }

  });

  useNuxtApp().$socket.on("update-tour", (results) => {

    if (data.value?.tourResults) {
      const ind: number = data.value.tourResults.findIndex(tr => tr.champ.slug === results.champ.slug);

      if (ind > -1) {
        data.value.tourResults[ind] = {...results};
      }
    }
  });

  useNuxtApp().$socket.on("results-live", async () => {
    await refreshInfo()
  });*/

})

onBeforeUnmount(() => {
 // useNuxtApp().$socket.removeAllListeners();
  socket.value?.disconnect();
})

function addPosts(loadedPosts: ISmallPost[]): void {
  data.value?.posts.push(...loadedPosts)
}
</script>

<style lang="scss" scoped>
</style>
