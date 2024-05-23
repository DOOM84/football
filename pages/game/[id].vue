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
      <div class="md:col-span-2 text-sm shadow-md shadow-zinc-800/20 pt-4 items-center">

        <div v-if="refreshIcon" class="text-center">
          <Icon name="eos-icons:loading" class="text-gray-600" size="80"/>
        </div>

        <div class="flex justify-center font-bold flex-row  gap-3 text-lg sm:text-xl mb-3 items-center">
          <div class="flex text-sm sm:text-lg basis-1/3 flex-col items-center">
            <div>
              <img class="w-[30px] h-[30px]"
                   :title="data.match.champResult?.home.name || data.match.ecupResult?.home.name"
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                   :style="`
             background: url('/teams.png') ${data.match.champResult?.home.sprite || data.match.ecupResult?.home.sprite}`"
                   :alt="data.match.champResult?.home.name || data.match.ecupResult?.home.name"/>
            </div>
            <div class="text-center leading-none">
              <nuxt-link class="hover:underline"
                         v-if="data.match.champResult?.home.slug || data.match.ecupResult?.home?.team?.slug"
                         :to="data.match.champResult?.home.slug ?'/team/'+data.match.champResult?.home.slug : '/team/'+data.match.ecupResult?.home?.team?.slug">
                {{ data.match.champResult?.home.name || data.match.ecupResult?.home.name }}
              </nuxt-link>
              <span v-else>{{ data.match.champResult?.home.name || data.match.ecupResult?.home.name }}</span>
            </div>
          </div>
          <div class="flex font-bold basis-1/3 sm:basis-auto gap-2 justify-center items-center">
            <div class="flex flex-col justify-center">
              <div class="flex gap-2 justify-center">
              <div>
                {{ data.match.champResult?.res1 >= 0 ? data.match.champResult.res1 : data.match.ecupResult?.res1 }}
              </div>
              <div>:</div>
              <div>
                {{ data.match.champResult?.res2 >= 0 ? data.match.champResult.res2 : data.match.ecupResult?.res2 }}
              </div>
              </div>
              <div class="text-xs font-normal text-center">
                {{data.match.champResult ? $showDate(+data.match.champResult.stamp*1000) : $showDate(+data.match.ecupResult.stamp*1000)}}
              </div>
            </div>

          </div>
          <div
              class="flex text-sm sm:text-lg  basis-1/3 flex-grow: 0; flex-col justify-center items-center">
            <div>
              <img class="w-[30px] h-[30px]"
                   :title="data.match.champResult?.away.name || data.match.ecupResult?.away.name"
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                   :style="`
             background: url('/teams.png') ${data.match.champResult?.away.sprite || data.match.ecupResult?.away.sprite}`"
                   :alt="data.match.champResult?.away.name || data.match.ecupResult?.away.name"/>
            </div>
            <div class="text-center leading-none">
              <nuxt-link class="hover:underline"
                         v-if="data.match.champResult?.away.slug || data.match.ecupResult?.away?.team?.slug"
                         :to="data.match.champResult?.away.slug ?'/team/'+data.match.champResult?.away.slug : '/team/'+data.match.ecupResult?.away?.team?.slug">
                {{ data.match.champResult?.away.name || data.match.ecupResult?.away.name }}
              </nuxt-link>
              <span v-else>{{ data.match.champResult?.away.name || data.match.ecupResult?.away.name }}</span>
            </div>
          </div>
          <div>
          </div>
        </div>

        <div class="flex justify-between flex-col gap-1 px-3 sm:flex-row sm:gap-0">
          <div v-for="(teamId, place) in data.goals" :key="teamId.score">
            <ul>
              <li v-for="goal in data.grouppedGoals[teamId.teamId]" class="flex gap-3 justify-end items-center"
                  :class="place === 'home' ? 'flex-row-reverse' : ''"
              >
                <div class="flex flex-wrap">
                  <ThePlayerLink :slug="goal.player.slug" :name="goal.player.name"/>
                  <span class="ml-1" v-if="goal.detail.toLowerCase() === 'own goal'">(аг)</span>
                  <span class="ml-1" v-if="goal.detail.toLowerCase() === 'penalty'">(п)</span>
                </div>

                <div>
                  <span>{{ goal.time.elapsed }}'</span>
                  <small v-if="goal.time.extra">(+{{ goal.time.extra }}')</small>

                </div>
                <Icon name="ion:ios-football" class="text-gray-600 min-w-[20px]" size="20"/>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-5 flex justify-between flex-col gap-1 px-3 sm:flex-row sm:gap-0">
          <div v-for="(teamId, place) in data.cards" :key="teamId.cards">
            <ul>
              <li v-for="card in data.grouppedCards[teamId.teamId]" class="flex gap-3 justify-end items-center"
                  :class="place === 'home' ? 'flex-row-reverse' : ''"
              >
                <div class="flex flex-wrap">
                  <ThePlayerLink :slug="card.player.slug" :name="card.player.name"/>
                </div>
                <div>
                  <span>{{ card.time.elapsed }}'</span>
                  <small v-if="card.time.extra">(+{{ card.time.extra }}')</small>
                </div>
                <Icon name="tabler:rectangle-vertical-filled" class="min-w-[20px]"
                      :class="card.detail.toLowerCase() === 'yellow card' ? 'text-yellow-400' : 'text-red-500'"
                      size="20"/>
              </li>
            </ul>
          </div>
        </div>

        <div class="text-center mt-3 font-semibold">События матча</div>

        <template v-for="event in events">
          <div class="flex items-center gap-1 px-3 py-1 flex-wrap">
            <div v-if="event.icon" class="h-[20px] w-[20px]">
              <Icon :name="event.icon.icon"
                    :class="event.icon.color" size="20"/>
            </div>

            {{ event.time.elapsed }}<small>{{ event.time.extra }} </small>

            <template v-if="event.type.toLowerCase() === 'goal'">
              <ThePlayerLink  :name="event.player.name" :slug="event.player.slug"/>
              {{ event.detail }}
              {{ event.detail.toLowerCase() === 'забивает гол' && event.assist?.name ? 'после паса' : '' }}
              <ThePlayerLink :name="event.assist.name" :slug="event.assist.slug"/>
            </template>

            <ThePlayerLink v-if="event.type.toLowerCase() === 'card' || event.type.toLowerCase() === 'var'" :name="event.player.name"
                           :slug="event.player.slug"/>

            <template v-if="event.type.toLowerCase() === 'subst'">
              <ThePlayerLink :name="event.assist.name" :slug="event.assist.slug"/>
              <div class="h-[20px] w-[20px]">
                <Icon name="mdi:arrow-down-bold-outline" class="text-red-500" size="20"/>
              </div>
              <ThePlayerLink :name="event.player.name" :slug="event.player.slug"/>
              <div class="h-[20px] w-[20px]">
                <Icon name="mdi:arrow-up-bold-outline" class="text-green-500" size="20"/>
              </div>
            </template>

            {{ event.comments }} {{ event.type.toLowerCase() !== 'goal' ? event.detail : '' }}
          </div>
        </template>
        <ClientOnly>
        <div v-if="data.match.homeSquad.length && data.match.awaySquad.length">
          <div class="bg-[length:100%_100%] bg-local bg-pitch bg-center bg-no-repeat text-white border max-w-[800px] h-[420px] flex overflow-y-hidden overflow-auto">
            <div class="flex basis-1/2 justify-start">
              <template v-for="(line, i) in data.match.homeSquad" :key="`home-${i}`">
                <div class="flex flex-col justify-center h-full ">
                  <div v-for="player in line" class="self-stretch text-center leading-tight"
                       :class="[line.length > 4 ? 'py-2' : 'py-5', data.match.homeSquad.length > 4 ? 'pl-1' : 'pl-3']"
                  >
                    <div class="flex flex-col items-center">
                      <div class="bg-center rounded-full flex justify-center items-center w-[30px] h-[30px]"
                           :style="`background: url(${player.img || '/no_player.png'}); background-size: 30px 30px;  background-repeat: no-repeat;`"
                      >
                      </div>
                      <div class="p-0 m-0" :style="`border-bottom: 0.3rem solid #${homeColor || 'FF0000'};`">
                        <ThePlayerLink :font-sz="'text-xs'" :number="player.number" :slug="player.slug" :name="player.name.split(' ')[player.name.split(' ').length -1] || player.name"/>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div class="flex basis-1/2 justify-end">
              <template v-for="(line, i) in data.match.awaySquad" :key="`away-${i}`">
                <div class="flex flex-col justify-center h-full ">
                  <div v-for="player in line"
                       class="self-stretch text-center leading-tight"
                       :class="[line.length > 4 ? 'py-2' : 'py-5', data.match.awaySquad.length > 4 ? 'pl-1' : 'pl-3']"
                  >
                    <div class="flex flex-col items-center">
                      <div class="bg-center rounded-full flex justify-center items-center w-[30px] h-[30px]"
                           :style="`background: url(${player.img || '/no_player.png'}); background-size: 30px 30px;  background-repeat: no-repeat;`"
                      >
                      </div>
                      <div class="p-0 m-0" :style="`border-bottom: 0.3rem solid #${awayColor || '0000ff'};`">
                        <ThePlayerLink :font-sz="'text-xs'" :number="player.number" :slug="player.slug" :name="player.name.split(' ')[player.name.split(' ').length -1] || player.name"/>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        </ClientOnly>

        <div class="text-center mt-3 font-semibold">Составы команд</div>
        <div class="my-5 flex justify-around">
          <div v-for="lineup in data.match.lineups">
            <div v-for="squad in lineup.squads" class="flex flex-wrap">
              <ThePlayerLink
                  :pos="squad.player.pos"
                  :number="`${squad.player.number}`"
                  :name="squad.player.name"
                  :slug="squad.player.slug"/>
              <template v-if="squad.player.subst">
                <Icon name="mdi:arrow-down-bold-outline" class="text-red-500 ml-1" size="20"/>
                <span>
                      {{ squad.player.subst.elapsed }}'
                    </span>
                <small v-if="squad.player.subst?.extra">
                  (+{{ squad.player.subst.extra }}')
                </small>
              </template>
            </div>
            <div class="text-center font-semibold mt-3 mb-1">Запасные:</div>
            <div v-for="subst in lineup.substitutes" class="flex flex-wrap">
              <ThePlayerLink :pos="subst.player.pos"
                             :number="`${subst.player.number}`"
                             :name="subst.player.name"
                             :slug="subst.player.slug"/>
              <template v-if="subst.player.subst">
                <Icon name="mdi:arrow-up-bold-outline" class="text-green-500 ml-1" size="20"/>
                <span>
                      {{ subst.player.subst.elapsed }}'
                    </span>
                <small v-if="subst.player.subst?.extra">
                  (+{{ subst.player.subst.extra }}')
                </small>
              </template>
            </div>
          </div>
        </div>

      </div>
      <div>
        <div class="z-10">
          <div class="">
            <ClientOnly>
            <TheBaseTabInfo v-if="data && Object.keys(data.tourResults).length" :info-to-show="data.tourResults"
                            :info-type="'shortResults'"/>
            </ClientOnly>
          </div>
          <div>
            <ClientOnly>
          <TheTabs v-if="Object.keys(data.ecupResults).length && data.ecupResults.poResults.length" :ecupPoResults="data.ecupResults.poResults" :info-type="'ecupPoResults'"/>
            </ClientOnly>
          </div>
          <div>
            <ClientOnly>
            <TheTabs v-if="Object.keys(data.ecupResults).length && Object.keys(data.ecupResults.groupResults).length" :ecupResults="data.ecupResults.groupResults"
                   :info-type="'ecupResults'"/>
            </ClientOnly>
          </div>
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
import type {ISmallPost, ITour} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';

const socket = ref<Socket>();
const route = useRoute();

const refreshIcon = ref<boolean>(false);

const {data, pending, error} = await useLazyFetch<{
  match: Record<string, any>;
  grouppedGoals: Record<string, any>;
  grouppedCards: Record<string, any>;
  cards: Record<string, any>;
  goals: Record<string, any>;
  posts: ISmallPost[];
  ecupResults: Record<string, any>;
  tourResults: ITour
}>(route.query.season ? '/api/archiveMatchInfo' : '/api/matchInfo',
    {
      params: {apiId: route.params.id, loadPosts: true, season: route.query.season},
      onResponseError({request, response, options}) {
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

const title = computed(() => 'Новости европейского футбола - Матч');

function getIcon(type: string, detail: string) {
  if (type.toLowerCase() === 'card') {
    const icon = 'tabler:rectangle-vertical-filled'
    const color = detail.toLowerCase() === 'yellow card' ? 'text-yellow-400' : 'text-red-500';
    return {
      icon,
      color
    }
  }
  if (type.toLowerCase() === 'subst') {
    const icon = 'tabler:arrows-down-up'
    const color = 'text-black-600';
    return {
      icon,
      color
    }
  }

  if (type.toLowerCase() === 'goal') {
    const icon = 'ion:ios-football'
    const color = 'text-sky-600';
    return {
      icon,
      color
    }
  }
  if (type.toLowerCase() === 'var') {
    const icon = 'ph:video-camera-fill'
    const color = 'text-black-200';
    return {
      icon,
      color
    }
  }
}

function getDetail(detail: string) {

  if(!detail){return ''}

  if (detail.toLowerCase() === 'penalty') {
    return 'забивает пенальти!'
  }
  if (detail.toLowerCase() === 'goal cancelled') {
    return 'Гол отменен ВАР'
  }
  if (detail.toLowerCase() === 'goal confirmed') {
    return 'Гол подтвержден ВАР'
  }
  if (detail.toLowerCase() === 'goal disallowed - offside') {
    return 'Гол отменен ВАР - офсайд'
  }
  if (detail.toLowerCase() === 'goal disallowed - handball') {
    return 'Гол отменен ВАР - игра рукой'
  }
  if (detail.toLowerCase() === 'goal disallowed - foul') {
    return 'Гол отменен ВАР - нарушение правил'
  }
  if (detail.toLowerCase() === 'penalty confirmed') {
    return 'Пенальти подтвержден ВАР'
  }
  if (detail.toLowerCase() === 'penalty awarded') {
    return 'Пенальти назначен ВАР'
  }
  if (detail.toLowerCase() === 'penalty cancelled') {
    return 'Пенальти отменен ВАР'
  }
  if (detail.toLowerCase() === 'card upgrade') {
    return 'Красная карточка определена ВАР'
  }
  if (detail.toLowerCase() === 'red card cancelled') {
    return 'Красная карточка отменена ВАР '
  }
  if (detail.toLowerCase() === 'card reviewed') {
    return 'Определение возможной красной карточки ВАР'
  }
  if (detail.toLowerCase() === 'normal goal') {
    return 'забивает гол'
  }
  if (detail.toLowerCase() === 'missed penalty') {
    return 'не забил пенальти'
  }
  if (detail.toLowerCase() === 'own goal') {
    return 'забивает в свои ворота'
  }
  return detail;
}

function getInfo(info: string) {

  if(!info) return '';

  if (info.toLowerCase() === 'persistent fouling') {
    return 'частые нарушения'
  }
  if (info.toLowerCase() === 'foul') {
    return 'нарушение правил'
  }
  if (info.toLowerCase() === 'penalty shootout') {
    return 'Серия пенальти'
  }
  if (info.toLowerCase() === 'argument') {
    return 'споры с арбитром'

  }
  if (info.toLowerCase() === 'time wasting') {
    return 'затягивание времени'
  }
  if (info.toLowerCase() === 'diving') {
    return 'нырок'
  }
  if (info.toLowerCase() === 'elbowing') {
    return 'удар локтем'
  }
  if (info.toLowerCase() === 'holding') {
    return 'захват рукой'
  }
  if (info.toLowerCase() === 'delay of game') {
    return 'затягивание времени'
  }
  if (info.toLowerCase() === 'roughing') {
    return 'удар в соперника'
  }
  if (info.toLowerCase() === 'unsportsmanlike conduct') {
    return 'неспортивное поведение'
  }
  if (info.toLowerCase() === 'serious foul') {
    return 'грубое нарушение'
  }
  if (info.toLowerCase() === 'handball') {
    return 'игра рукой'
  }
  if (info.toLowerCase() === 'handling') {
    return 'игра рукой'
  }
  if (info.toLowerCase() === 'tripping') {
    return 'подножка'
  }
  if (info.toLowerCase() === 'simulation') {
    return 'симуляция'
  }
  if (info.toLowerCase() === 'violent conduct') {
    return 'агрессивное поведение'
  }
  if (info.toLowerCase() === 'professional foul last man') {
    return 'фол последней надежды'
  }
  if (info.toLowerCase() === 'unallowed field entering') {
    return 'неразрешенный выход на поле'
  }
  if (info.toLowerCase() === 'misses next match') {
    return 'пропускает следующий матч'
  }
  return info
}

const events = computed(() => {
  return data.value!.match.info.map((event: any) => {
    return {
      icon: getIcon(event.type, event.detail),
      assist: {
        name: event.assist?.name || '',
        slug: event.assist?.slug || null,
      },
      player: {
        name: event.player?.name || '',
        slug: event.player?.slug || null,
      },
      comments: event.comments ? `(${getInfo(event.comments)})` : '',
      detail: event.type.toLowerCase() === 'var' || event.type.toLowerCase() === 'goal' ? getDetail(event.detail) : '',
      type: event.type,
      time: {
        elapsed: event.time?.elapsed ? `${event.time?.elapsed}'` : '',
        extra: event.time?.extra ? `(+${event.time?.extra}')` : '',
      }
    }
  })
})

useSeoMeta({
  title: () => title.value,
});

async function refreshInfo() {
  try {
    refreshIcon.value = true;
    const res = await $fetch<Record<string, any>>('/api/matchInfo', {
      params: {apiId: route.params.id},
    });
    data.value!.match = res.match;
    data.value!.grouppedGoals = res.grouppedGoals;
    data.value!.grouppedCards = res.grouppedCards;
    data.value!.cards = res.cards;
    data.value!.goals = res.goals;
    data.value!.ecupResults = res.ecupResults;
    data.value!.tourResults = res.tourResults;

  } catch (e) {
    console.log(e);
  } finally {
    refreshIcon.value = false;
  }

}

const homeColor = computed(()=>{
  return data.value?.match?.lineups[0]?.team?.colors?.player?.primary ?
      data.value?.match.lineups[0].team.colors.player.primary : 'red'
})

const awayColor = computed(()=>{
  return data.value?.match?.lineups[1]?.team?.colors?.player?.primary ?
      data.value?.match.lineups[1].team.colors.player.primary : 'blue'
})


onMounted(async () => {
  socket.value = io({
    path: '/api/socket.io'
  })

  socket.value.emit('joinRoom', 'match');

  socket.value.on("results-live", async () => {
    if(!route.query.season){
      await refreshInfo();
    }
  });

})

onBeforeUnmount(() => {
  socket.value?.disconnect();
})

</script>

<style scoped>

</style>