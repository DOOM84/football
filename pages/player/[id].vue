<template>
    <div>
        <div class="grid md:grid-cols-[35%_65%] lg:grid-cols-3 grid-cols-1 ">
          <div v-if="pending || !data" class="col-span-3 text-center pt-10">
            <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
          </div>
          <template v-else>
            <div class="shadow-md shadow-zinc-800/20 ">
                <div class="text-center flex flex-col items-center justify-center">
                    <h1 class="text-2xl font-bold">{{ htmlDec(data.player.name) }}</h1>
                    <img class="max-w-[150px]" @error="imageUrlAlt" :src="data.player.img" alt="">
                    <ul class="list-none text-center my-4">
                        <li class="mb-4">
                            Дата рождения:
                            <p>
                                <strong>
                                    {{ data.player?.info?.birth }}
                                </strong>
                            </p>
                        </li>
                        <li class="mb-4">
                            Гражданство:
                            <p>
                                <strong>
                                    {{ data.player?.country || data.player?.info?.nationality /*|| player.nationality*/ }}
                                </strong>
                            </p>
                        </li>
                      <li>
                      </li>
                        <li v-if="data.player?.team" class="mb-4">
                            <div class="flex flex-col justify-center">
                                <div>
                                    Клуб:
                                </div>
                              <template v-if="Object.keys(data.player?.team).length">
                                <div class="m-auto">
                                  <img :alt="data.player?.team.name" class="w-[30px] h-[30px]"
                                       src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                                       :style="`background: url('/teams.png') ${data.player?.team.sprite};`"/>
                                </div>
                                <nuxt-link :to="'/team/'+data.player?.team.slug">
                                  <strong class="text-blue-600">
                                    {{ data.player?.team.name }}
                                  </strong>
                                </nuxt-link>
                              </template>
                              <template v-else>
                                Нет / Другой
                              </template>

                            </div>

                        </li>
                        <li class="mb-4" v-if="data && data.player">
                            Позиция:
                            <p>
                                <strong>
                                    {{ data.player.position }}
                                </strong>
                            </p>
                        </li>
                        <li>
                            Рост/Вес:
                            <p>
                                <strong>
                                    {{ data.player?.info?.height }}/{{ data.player?.info?.weight }}
                                </strong>
                            </p>
                        </li>
                    </ul>
                </div>

                <div>
                  <TheBaseTabInfo v-if="data && data.champ" :info-to-show="data.champ.teams" :info-type="'shortStands'" />
                </div>


            </div>
            <div class="lg:col-span-2">
                <div class="px-1 my-4 flex flex-wrap text-center justify-center gap-4 ">
                    <ThePostsCard v-if="data && data.posts" :post="post" v-for="post in data.posts" :key="post.slug"/>
                </div>
              <div class="p-4 mt-3">
                <TheLoadMore @addPosts="addPosts" :limit="5" :player-id="data.player.id" :my="0" :count="data.posts.length" />
              </div>
            </div>
          </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {IChamp, IPlayer, IPost} from "~/types/interfaces";
import htmlDec from "../../helpers/htmlDec";

const route = useRoute();

const {data, pending, error} = await useLazyFetch<{
  player: IPlayer;
  champ:IChamp;
  posts: IPost[];
}>('/api/player', {params: {slug: route.params.id}, onResponseError({request, response, options}) {
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

const title = computed(()=> 'Новости европейского футбола - Игрок - ' + data.value?.player?.name)

useSeoMeta({
  title: () => title.value,
});

function addPosts(loadedPosts: IPost[]): void {
  data.value?.posts.push(...loadedPosts)
}

function imageUrlAlt(event: Event): void {
  (event.target as HTMLImageElement).src = "/no_player.png";
}



</script>

<style scoped>

</style>