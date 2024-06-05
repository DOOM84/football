<template>
    <tr class="border-b border-solid border-zinc-800 border-opacity-10 relative group" v-for="(result, i) in results"
        :class="isLive(result.stamp*1000)">
        <td class="text-center res-time">
            <small class="block">{{$matchTime(result.stamp*1000) }}</small>
          <template v-if="user?.app_metadata?.admin">
            <label for="status" class="text-xs">Онлайн</label>
            <input type="checkbox" @change="setResult(result)" v-model="result.is_info"  id="status">
            <br />
          </template>
          <template v-if="result.is_info">
            <nuxt-link class="underline hover:no-underline" :to="`/game/${result.api_id}${queryParam}`">
              live
            </nuxt-link>
          </template>
        </td>
        <td class="text-center res-logo">
            <div class="flex justify-center">
            <img v-if="result.home.sprite" class="w-[30px] h-[30px]" :alt="result.home.name"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                 :style="`background: url('/teams.png') ${result.home.sprite};`"/>
              <img v-else class="w-[30px] h-[30px]" :alt="result.home.name" src="/no_team.png"/>
            </div>
            <div class="text-center py-1">
                <nuxt-link class="res-team hover:underline" v-if="result.home.slug" :to="'/team/'+result.home.slug">
                    {{ result.home.name }}
                </nuxt-link>
                <span class="res-team" v-else>
            {{ result.home.name }}
         </span>
            </div>
        </td>
      <td colspan="3">
        <template v-if="result.is_info">
          <nuxt-link :to="`/game/${result.api_id}${queryParam}`" class="hover:underline">
            <div class="whitespace-nowrap text-center">
              <span class="mr-1 sm:mr-3 whitespace-nowrap">{{ result.res1 }}</span>
              :
              <span class="whitespace-nowrap ml-1 sm:ml-3"> {{ result.res2 }}</span>
            </div>
          </nuxt-link>
        </template>
        <template v-else>
          <div class="whitespace-nowrap text-center">
            <span class="mr-1 sm:mr-3 whitespace-nowrap">{{ result.res1 }}</span>
            :
            <span class="whitespace-nowrap ml-1 sm:ml-3"> {{ result.res2 }}</span>
          </div>
        </template>
        <transition name="page">
        <div v-if="result.info" class="animate-fade-in-down z-50 bg-gray-800/75 absolute left-[20%] text-[13px] whitespace-nowrap
        text-white hidden group-hover:flex w-[60%] group-hover:justify-between px-[3px] gap-1"
             :class="(results.length === 1 || i === results.length - 1) &&
            ((result.info && !Array.isArray(result.info[result.home.api_id]) ? 1 : result.info && result.info[result.home.api_id].length <= 2 ? 1 : -1) === 1
                && (result.info && !Array.isArray(result.info[result.away.api_id]) ? 1 : result.info && result.info[result.away.api_id].length <= 2 ? 1 : -1) === 1)
               ? 'bottom-[100%]' : 'top-[100%]'"
        >
          <ul class="basis-auto flex-grow: 0; overflow-x-hidden m-0 p-0">
            <li class="m-0 p-0" v-for="(goal, i) in (result as Record<string,any>).info[result.home.api_id]" :key="`home-${i}`">
              {{htmlDec(goal.player.name)}} <small>{{goal.time.elapsed}}'</small> <small v-if="goal.time.extra">(+{{goal.time.extra}}')</small>
            </li>
          </ul>
          <ul class="basis-auto flex-grow: 0; overflow-x-hidden m-0 p-0 text-right">
            <li class="m-0 p-0 overflow-x-hidden" v-for="(goal, i) in (result as Record<string,any>).info[result.away.api_id]" :key="`away-${i}`">
              {{htmlDec(goal.player.name)}} <small>{{goal.time.elapsed}}'</small> <small v-if="goal.time.extra">(+{{goal.time.extra}}')</small>
            </li>
          </ul>

        </div>
        </transition>
      </td>

        <td class="text-center res-logo py-1">
            <div class="flex justify-center ">
                <img v-if="result.away.sprite" class="w-[30px] h-[30px] text-center" :alt="result.away.name"
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                     :style="`background: url('/teams.png') ${result.away.sprite};`"/>
              <img v-else :alt="result.away.name" src="/no_team.png"/>
            </div>

            <div class="text-center">
                <nuxt-link class="res-team hover:underline" v-if="result.away.slug" :to="'/team/'+result.away.slug">
                    {{ result.away.name }}
                </nuxt-link>
                <span class="res-team" v-else>
            {{ result.away.name }}
         </span>
            </div>
        </td>
    </tr>
  <div>
  </div>
</template>

<script lang="ts" setup>

import type {IResult} from "~/types/interfaces";
import htmlDec from "~/helpers/htmlDec";

const user = useSupabaseUser();

const {auth} = useSupabaseClient();

const {$diffDate, $matchTime} = useNuxtApp();

const season = inject<Ref<string>>('season');

/*const props = defineProps<{
  results: IResult[],
  iter: number,
}>()*/

const props = withDefaults(defineProps<{
  results: IResult[];
  iter: number,
}>(), {
  iter: 0,
})

function isLive(stamp: number): string {
    const minutes = $diffDate(stamp);
    return (minutes > 0 && minutes <= 115) ? 'isLive' : ''
}

const queryParam = computed(()=>{
  return season!.value ? '?season='+season!.value : ''
})

async function setResult(res: IResult) {
  const {data} = await auth.getUser();

  if (!user.value || !user.value.app_metadata?.admin || !data.user || !data.user.app_metadata?.admin) {
    useNuxtApp().$toast.error('Вы не авторизованы');
    return
  }

  try {
    useNuxtApp().$toast.info('Обработка...');

      const {result, info} = await $fetch<{ result?: boolean, info?: Record<any, any[]> }>(season!.value ?'/api/admin/setArchiveResult' : '/api/admin/setResult', {
        method: 'PUT',
        body: {api_id: res.api_id, is_info: res.is_info, season: season!.value},
      })

    if(season!.value){
      useNuxtApp().$toast.success('Сохранено успешно!');
      return
    }

    if(info){
      res.info = info as any;
      res.res1 = Array.isArray(info![+res.home.api_id!]) ? info![+res.home.api_id!].length : 0;
      res.res2 = Array.isArray(info![+res.away.api_id!]) ? info![+res.away.api_id!].length : 0;
    }else if(res.is_info && (Number(res.stamp) < Math.round(Date.now() / 1000))){
      res.res1 = 0;
      res.res2 = 0;
    }
    useNuxtApp().$toast.success('Сохранено успешно!');

  }catch (e) {
    console.log(e);
  }
}

</script>

<style lang="scss" scoped>

.res-time {
    padding-left: 5px;
    width: 5%
}

.res-logo {
    padding: 0;
    margin: 0;
    width: 35%
}

.res-team {
    padding-left: 0;
    padding-right: 0;
    white-space: normal
}

    .isLive {
        color: red !important;
        a{
            color: red !important;
        }
    }

</style>