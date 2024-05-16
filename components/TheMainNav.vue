<template>
    <nav class="hidden lg:flex w-full items-center text-zinc-800 font-semibold text-[14px] justify-center bg-gray-100 h-[60px] px-3">
        <div class="relative group h-full ">
            <div class="group-hover:bg-gray-200 h-full w-full flex items-center px-7 uppercase cursor-pointer">
                ЧЕМПИОНАТЫ
            </div>
            <ul class="hidden absolute z-[101] w-full bg-white  text-gray-800 shadow-xl group-hover:showMenu origin-top-right">
                <nuxt-link class="z-[101]" v-for="champ in chs" :to="'/'+champ.slug" :key="champ.slug">
                    <li class="py-3 px-3 hover:bg-zinc-100 z-[101]"> {{ champ.name }}</li>
                </nuxt-link>
            </ul>
        </div>
        <div class="relative group h-full ">
            <div class="group-hover:bg-zinc-200 h-full w-full flex items-center px-7 uppercase cursor-pointer">
                ТУРНИРНЫЕ ТАБЛИЦЫ
            </div>
            <ul class="hidden absolute z-[101] w-full bg-white   text-gray-800 shadow-xl group-hover:showMenu">
                <nuxt-link v-for="champ in chs" :to="'/'+champ.slug+'/stands'" :key="champ.slug">
                    <li class="py-3 px-3 hover:bg-zinc-100 z-[101]"> {{ champ.name }}</li>
                </nuxt-link>
            </ul>
        </div>
        <div class="relative group h-full ">
            <div class="group-hover:bg-zinc-200 h-full w-full flex items-center px-7 uppercase cursor-pointer">
                КАЛЕНДАРЬ
            </div>
            <ul class="hidden absolute z-[101] w-full bg-white  text-gray-800 shadow-xl group-hover:showMenu">

                <nuxt-link v-for="champ in chs" :to="'/'+champ.slug+'/calendar'" :key="champ.slug">
                    <li class="py-3 px-3 hover:bg-zinc-100 z-[101]"> {{ champ.name }}</li>
                </nuxt-link>

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
import type {IChampDB, IEcupDB} from "~/types/interfaces";

const props = defineProps<{
  chs: IChampDB[];
  ecups: IEcupDB[];
}>()

</script>

<style scoped>

</style>