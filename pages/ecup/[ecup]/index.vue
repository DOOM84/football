<template>
  <div class="grid lg:grid-cols-3 grid-cols-1">
    <div v-if="pending || !data" class="col-span-3 text-center pt-10">
      <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
    </div>
    <template v-else>
      <div class="lg:col-span-2">
        <div class="text-center">
          <ClientOnly>
            <TheSlides :headlines="data.headLines"/>
          </ClientOnly>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-[45%_55%] ">
          <div class="order-last sm:order-first overflow-x-auto">
            <div class="overflow-x-auto grid grid-cols-1">
              <template v-if="Object.keys(data.ecupStands?.stands).length"
                        v-for="(info, group) in data.ecupStands.stands">
                <TheBaseTabInfo :infoToShow="info.teams" :info-type="'ecupTableStands'">
                  <thead>
                  <tr>
                    <th class="text-center pl-1 py-[0.7rem] bg-zinc-800 text-zinc-200 ">#</th>
                    <th class="text-center pl-1 py-[0.7rem] bg-zinc-800 text-zinc-200" colspan="2">
                      {{group !== 'null' ? 'Группа '+group : 'Команда'}}
                    </th>
                    <th class="text-center py-[0.7rem] bg-zinc-800 text-zinc-200">И</th>
                    <th class="text-center py-[0.7rem] bg-zinc-800 text-zinc-200">О</th>
                  </tr>
                  </thead>
                </TheBaseTabInfo>
              </template>
              <div class="lg:order-last order-first lg:hidden">
                <TheTabs v-if="data.poResults.length" :ecupPoResults="data.poResults" :info-type="'ecupPoResults'"/>
                <TheTabs v-if="Object.keys(data.groupResults).length" :ecupResults="data.groupResults['null']"
                         :info-type="'ecupResults'"/>
              </div>
            </div>

          </div>
          <div class="shadow-md shadow-zinc-800/20 z-10">
            <ThePostsItem :post="post" v-for="post in data.posts" :key="post.slug"/>
            <TheLoadMore @addPosts="addPosts" :limit="5" :ecup-id="data.ecup.id" :count="data.posts.length"/>
            <div class="text-right text-sm py-1 mr-3">
              <nuxt-link to="/news">Все новости</nuxt-link>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="hidden lg:block">
          <div class="overflow-x-auto">
            <TheTabs v-if="data.poResults.length" :ecupPoResults="data.poResults" :info-type="'ecupPoResults'"/>
            <TheTabs v-if="Object.keys(data.groupResults).length" :ecupResults="data.groupResults['null']"
                     :info-type="'ecupResults'"/>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import type {IEcup, IEcupResult, IEcupStand, IPost} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';

const socket = ref<Socket>();
const route = useRoute();

const {data, pending, error} = await useLazyFetch<{
  ecup: IEcup; posts: IPost[]; headLines: IPost[];
  ecupStands: IEcupStand;
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
}>('/api/ecup', {
  params: {ecup: route.params.ecup, count: 35}, onResponseError({request, response, options}) {
    showError({
      fatal: true,
      statusCode: 404,
      message: 'Страница не найдена'
    })
  }
})

if (error.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    message: 'Страница не найдена'
  })
}

const title = computed(() => 'Новости европейского футбола - ' + data?.value?.ecup?.name)

useSeoMeta({
  title: () => title.value,
});

function addPosts(loadedPosts: IPost[]): void {
  data.value?.posts.push(...loadedPosts)
}

async function refreshInfo() {
  try {

    const {groupResults, poResults}  = await $fetch<{
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
    }>('/api/liveResults', {
      params: {ecup: route.params.ecup},
    });

    data.value!.groupResults = groupResults;
    data.value!.poResults = poResults;

  } catch (e) {
    console.log(e);
  }
}

onMounted(() => {
  socket.value = io({
    path: '/api/socket.io'
  });

  socket.value.emit('joinRoom', 'ecup');

  socket.value.on("add-post", (post) => {

    if (route.params.ecup && route.params.ecup === post.ecup?.slug) {
      if (post) {
        data.value?.posts.unshift(post);
      }
    }

  });

  socket.value.on("results-live", async () => {
    await refreshInfo();
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
  socket.value?.disconnect();
})

</script>

<style lang="scss" scoped>
</style>


