<template>
  <div>
    <div class="grid md:grid-cols-[35%_65%] lg:grid-cols-3 grid-cols-1 ">
      <div v-if="pending || !data" class="col-span-3 text-center pt-10">
        <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
      </div>
      <template v-else>
        <div class="shadow-md shadow-zinc-800/20 ">
          <template v-if="data.team">
            <div class="flex flex-col justify-center items-center gap-2">
              <h1 class="text-2xl font-bold">{{ data.team.name }}</h1>
              <img class="max-w-[151px]" :src="data.team.img" alt="">
              <ul class="list-none text-center">
                <li class="mb-4">
                  Президент:
                  <p>
                    <strong>
                      {{ data.team.team_info.pres }}
                    </strong>
                  </p>
                </li>
                <li class="mb-4">
                  Главный тренер:
                  <p>
                    <strong>
                      {{ data.team.team_info.coach }}
                    </strong>
                  </p>
                </li>
                <li class="mb-4">
                  Стадион:
                  <p>
                    <strong>
                      {{ data.team.team_info.stad }}
                    </strong>
                  </p>
                </li>
                <li class="mb-4">
                  Год основания:
                  <p>
                    <strong>
                      {{ data.team.team_info.year }}
                    </strong>
                  </p>
                </li>
                <li class="mb-4">
                  Сайт клуба:
                  <p>
                    <a class="text-blue-700" target="_blank" :href="data.team.team_info.site">
                      {{ data.team.team_info.site }}
                    </a>
                  </p>
                </li>
              </ul>
            </div>
          </template>

          <div>
            <TheBaseTabInfo v-if="data && data.champ" :info-to-show="data.champ.teams" :info-type="'shortStands'"/>
          </div>
          <template v-if="data && data.ecupStands" :key="ecup.slug+i" v-for="(ecup, i) in data.ecupStands">
            <div class="w-full text-left bg-zinc-100">
              {{ ecup.name }}
            </div>
            <template v-if="Object.keys(ecup.stands).length" v-for="(info, group) in ecup.stands">
              <TheBaseTabInfo :infoToShow="info.teams" :info-type="'ecupTableStands'">
                <thead>
                <tr>
                  <th class="text-center pl-1 py-[0.7rem] bg-zinc-800 text-zinc-200 ">#</th>
                  <th class="text-center pl-1 py-[0.7rem] bg-zinc-800 text-zinc-200" colspan="2">Группа {{ group }}</th>
                  <th class="text-center py-[0.7rem] bg-zinc-800 text-zinc-200">И</th>
                  <th class="text-center py-[0.7rem] bg-zinc-800 text-zinc-200">О</th>
                </tr>
                </thead>
              </TheBaseTabInfo>
            </template>
          </template>
          <div>
            <ThePostsItem v-if="data && data.posts" :post="post" v-for="post in data.posts" :key="post.slug"/>
          </div>


        </div>
        <div class="lg:col-span-2">
          <div class="px-1 my-4 flex flex-wrap text-center justify-center gap-4 ">
            <div class="shadow-md shadow-zinc-800/20" v-for="player in data.players" :key="player.slug">
              <ThePlayerCard :player="player"/>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">

import type {IChampDB, IPlayer, ISmallPost, ITeam} from "~/types/interfaces";

const route = useRoute();

const {data, pending, error} = await useLazyFetch<{
  team: ITeam; champ: IChampDB; posts: ISmallPost[]; players: Partial<IPlayer>[]
}>('/api/team', {
  params: {slug: route.params.id}, onResponseError({request, response, options}) {
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

const title = computed(()=> 'Новости европейского футбола - Команда - ' + data.value?.team?.name)

useSeoMeta({
  title: () => title.value,
});



</script>

<style scoped>

</style>