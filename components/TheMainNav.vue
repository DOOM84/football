<template>
    <nav class="hidden lg:flex w-full items-center text-zinc-800 font-semibold text-[14px] justify-center bg-gray-100 h-[60px] px-3">
      <div class="relative group h-full ">
        <div class="group-hover:bg-gray-200 h-full w-full flex items-center px-7 uppercase cursor-pointer">
          ЧЕМПИОНАТЫ
        </div>
        <ul class="hidden absolute min-w-[150px] z-[101] w-full bg-white  text-gray-800 shadow-xl group-hover:showMenu origin-top-right">
          <div class="z-[101] relative" v-for="champ in chs" :key="champ.slug">
            <li  class="py-3 px-3 hover:bg-zinc-100 z-[101] group/cup">
              <nuxt-link class="z-[101]" :to="'/'+champ.slug" >
                <div class="hover:bg-zinc-100 z-[101]"> {{ champ.name }}</div>
              </nuxt-link>
              <ul class="
              min-w-[170px]
              bg-white
              text-gray-800
              hidden
              absolute
              group-hover/cup:showSubMenu">
                <nuxt-link class="z-[101]" :to="'/'+champ.slug">
                  <li class="py-3 px-3 hover:bg-zinc-100 z-[101]">
                    Новости
                  </li>
                </nuxt-link>
                <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/stands'">
                  <li class="py-3 px-3 hover:bg-zinc-100 z-[101]">
                    Турнирная таблица
                  </li>
                </nuxt-link>
                <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/calendar'">
                  <li class="py-3 px-3 hover:bg-zinc-100 z-[101]">
                    Календарь
                  </li>
                </nuxt-link>
                <template  v-for="league in champ.leagues" :key="league.slug">
                  <li class="p-1 text-center z-[101] border border-b-1">
                    {{league.name}}
                  </li>

                  <li class="py-3 px-3 hover:bg-zinc-100 z-[101]">
                    <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/league/'+league.slug+'/stands'">
                      Турнирная таблица
                    </nuxt-link>
                  </li>
                  <li class="py-3 px-3 hover:bg-zinc-100 z-[101]">
                    <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/league/'+league.slug+'/calendar'">
                      Календарь
                    </nuxt-link>
                  </li>
                </template>
              </ul>
            </li>
          </div>
        </ul>
      </div>
      <div class="relative group h-full ">
        <div class="group-hover:bg-gray-200 h-full w-full flex items-center px-7 uppercase cursor-pointer">
          КУБКИ
        </div>
        <ul class="hidden absolute min-w-[150px] z-[101] w-full bg-white  text-gray-800 shadow-xl group-hover:showMenu origin-top-right">
          <div class="z-[101] relative" v-for="champ in chs">
            <li  class="py-3 px-3 hover:bg-zinc-100 z-[101] group/cup cursor-pointer">
              {{ champ.name }}
              <ul class="
              min-w-[170px]
              bg-white
              text-gray-800
              hidden
              absolute
              group-hover/cup:showSubMenu">
                <nuxt-link class="z-[101]" v-for="cup in champ.cups"  :to="'/'+champ.slug+'/cup/'+cup.slug">
                  <li class="py-3 px-3 hover:bg-zinc-100 z-[101]">  {{cup.name}}</li>
                </nuxt-link>
              </ul>
            </li>
          </div>
        </ul>
      </div>
        <div class="relative group h-full" v-for="ecup in ecups" :key="ecup.slug">
            <div class="group-hover:bg-zinc-200 h-full w-full flex items-center px-7 uppercase cursor-pointer">
                {{ ecup.name }}
            </div>
            <ul class="hidden absolute z-[101] w-full bg-white   text-gray-800 shadow-xl
                  group-hover:showMenu">
                <nuxt-link :to="'/ecup/'+ecup.slug">
                    <li class="py-3 px-3 hover:bg-zinc-100 z-[101]"> Новости</li>
                </nuxt-link>
                <nuxt-link :to="'/ecup/'+ecup.slug+'/stands'">
                    <li class="py-3 px-3 hover:bg-zinc-100 z-[101]"> Турнирные таблицы</li>
                </nuxt-link>
                <nuxt-link :to="'/ecup/'+ecup.slug+'/calendar'">
                    <li class="py-3 px-3 hover:bg-zinc-100 z-[101]"> Календарь</li>
                </nuxt-link>
            </ul>
        </div>
    </nav>
</template>

<script setup lang="ts">
import type {IChamp, IEcup} from "~/types/interfaces";

const props = defineProps<{
  chs: IChamp[];
  ecups: IEcup[];
}>()

</script>

<style scoped>

</style>