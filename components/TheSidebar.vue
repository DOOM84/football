<template>
    <div class="bg-zinc-800 text-zinc-100 w-[250px] h-full fixed left-0 z-40 overflow-x-hidden">
        <div class="absolute right-1 top-1">
            <Icon @click="$emit('closeSidebar')" name="ic:baseline-close" class="cursor-pointer" size="30px"/>
        </div>
      <slot>
        <div class="p-0 mt-10 w-full relative group h-[50px]">
          <TheSearchInput />
        </div>
          <TheUserPanel :panel-class="'flex flex-col content-center items-center my-3 gap-2 font-semibold'" />
        <div class="mt-5 font-semibold">
          <div>
            <div @click="toggleMenu" class="w-full flex items-center px-7 py-3 uppercase cursor-pointer">
              Чемпионаты
            </div>
            <ul class="hidden z-10 bg-green-900">
              <li v-for="champ in chs" :key="champ.id">
                <div @click="toggleMenu" class="py-3 px-8 hover:bg-zinc-500/40 duration-300 cursor-pointer"> {{ champ.name }}</div>
                <ul class="hidden z-10 bg-green-900">
                  <nuxt-link class="z-[101]" :to="'/'+champ.slug">
                    <li class="py-3 px-8 hover:bg-blue-700/40 duration-300 bg-blue-900">
                      Новости
                    </li>
                  </nuxt-link>
                  <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/stands'">
                    <li class="py-3 px-8 hover:bg-blue-700/40 duration-300 bg-blue-900">
                      Турнирная таблица
                    </li>
                  </nuxt-link>
                  <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/calendar'">
                    <li class="py-3 px-8 hover:bg-blue-700/40 duration-300 bg-blue-900">
                      Календарь
                    </li>
                  </nuxt-link>
                  <template  v-for="league in champ.leagues" :key="league.slug">
                    <li class="py-1 text-center hover:bg-blue-700/40 duration-300 bg-green-900">
                      {{league.name}}
                    </li>
                    <li class="py-3 px-8 hover:bg-blue-700/40 duration-300 bg-blue-900">
                      <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/league/'+league.slug+'/stands'">
                        Турнирная таблица
                      </nuxt-link>
                    </li>
                    <li class="py-3 px-8 hover:bg-blue-700/40 duration-300 bg-blue-900">
                      <nuxt-link class="z-[101]" :to="'/'+champ.slug+'/league/'+league.slug+'/calendar'">
                        Календарь
                      </nuxt-link>
                    </li>
                  </template>
                </ul>
              </li>
            </ul>
          </div>
          <div>
            <div @click="toggleMenu" class="w-full flex items-center px-7 py-3 uppercase cursor-pointer">
              Кубки
            </div>
            <ul class="hidden z-10 bg-green-900">
              <li v-for="champ in chs" :key="champ.slug">
                <div @click="toggleMenu" class="py-3 px-8 hover:bg-zinc-500/40 duration-300 cursor-pointer"> {{ champ.name }}</div>
                <ul class="hidden z-10 bg-green-900">
                  <nuxt-link v-for="cup in champ.cups" :to="'/'+champ.slug+'/cup/'+cup.slug" :key="cup.slug">
                    <li class="py-3 px-8 hover:bg-blue-700/40 duration-300 bg-blue-900"> {{ cup.name }}</li>
                  </nuxt-link>
                </ul>
              </li>
            </ul>
          </div>
          <div>
            <div @click="toggleMenu" class="w-full flex items-center px-7 py-3 uppercase cursor-pointer">
              Еврокубки
            </div>
            <ul class="hidden z-10 bg-green-900">
              <li v-for="ecup in ecups" :key="ecup.slug">
                <div @click="toggleMenu" class="py-3 px-8 hover:bg-zinc-500/40 duration-300 cursor-pointer"> {{ ecup.name }}</div>
                <ul class="hidden z-10 bg-green-900">
                  <nuxt-link :to="'/ecup/'+ecup.slug">
                    <li class="py-3 px-8 hover:bg-zinc-500/40 duration-300 bg-blue-900"> Новости</li>
                  </nuxt-link>
                  <nuxt-link :to="'/ecup/'+ecup.slug+'/stands'">
                    <li class="py-3 px-8 hover:bg-zinc-500/40 duration-300 bg-blue-900"> Турнирные таблицы</li>
                  </nuxt-link>
                  <nuxt-link :to="'/ecup/'+ecup.slug+'/calendar'">
                    <li class="py-3 px-8 hover:bg-zinc-500/40 duration-300 bg-blue-900"> Календарь</li>
                  </nuxt-link>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </slot>
    </div>
</template>

<script setup lang="ts">
import type {IChamp, IEcup} from "~/types/interfaces";

const props = defineProps<{
  chs?: IChamp[],
  ecups?: IEcup[],
}>()


function toggleMenu(event: Event): void {
  (event.target as HTMLElement).nextElementSibling!.classList.toggle('hidden');
  (event.target as HTMLElement).nextElementSibling!.classList.toggle('showMenu');
}

</script>

<style scoped>

</style>