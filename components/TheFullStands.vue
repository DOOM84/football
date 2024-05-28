<template>
    <thead>
    <tr>
        <th class="text-center pl-1  bg-zinc-100">#</th>
        <th class="text-center pl-1  bg-zinc-100" colspan="2">Команда</th>
        <th class="text-center bg-zinc-100">
            <div class="flex items-center">
                <div>И</div>

                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('games', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('games', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center  bg-zinc-100">
            <div class="flex items-center">
                <div>В</div>

                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('win', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('win', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center  bg-zinc-100">
            <div class="flex items-center">
                <div>Н</div>
                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('draw', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('draw', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center  bg-zinc-100">
            <div class="flex items-center">
                <div>П</div>
                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('lost', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('lost', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center  bg-zinc-100">
            <div class="flex items-center">
                <div>З</div>
                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('goals', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('goals', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center bg-zinc-100">
            <div class="flex items-center">
                <div>Пр</div>
                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('missed', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('missed', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center  bg-zinc-100">
            <div class="flex items-center">
                <div>Р</div>
                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('diff', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('diff', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
        <th class="text-center  bg-zinc-100">
            <div class="flex items-center">
                <div>О</div>
                <div class="flex flex-col">
                    <Icon class="cursor-pointer" @click ="sortBy('points', 'desc')" name="material-symbols:fitbit-arrow-downward-sharp" size="20px"/>
                    <Icon class="cursor-pointer" @click ="sortBy('points', 'asc')" name="material-symbols:fitbit-arrow-upward-sharp" size="20px"/>
                </div>
            </div>
        </th>
    </tr>
    </thead>
    <tbody>
        <tr v-for="(team, i) in infoStands" :key="i" class="border-b border-solid border-zinc-800 border-opacity-10">
            <td class="text-center pt-1 px-2">
                {{ +i + 1 }}
            </td>
            <td colspan="2" class="text-left pt-1 px-2">
                <div class="flex items-center gap-2 min-w-[160px]">
                    <img :alt="team.name" class="w-[30px] h-[30px]"
                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                         :style="`background: url('/teams.png') ${team.sprite};`"/>

                <nuxt-link class="hover:underline overflow-hidden" v-if="team.slug" :to="'/team/'+team.slug">
                    {{ team.name }}
                </nuxt-link>
                <span class="overflow-hidden" v-else>
                {{ team.name }}
            </span>
                </div>
            </td>
            <td class="text-left">
                {{ team.games }}
            </td>
            <td class="text-left">
                {{ team.win }}
            </td>
            <td class="text-left">
                {{ team.draw }}
            </td>
            <td class="text-left">
                {{ team.lost }}
            </td>
            <td class="text-left">
                {{ team.goals }}
            </td>
            <td class="text-left">
                {{ team.missed }}
            </td>
            <td class="text-left">
                {{ team.diff }}
            </td>
            <td class="text-left">
                {{ team.points }}
            </td>
        </tr>
    </tbody>
    </template>

<script setup lang="ts">

import type {ITeam} from "~/types/interfaces";

const props = defineProps<{
  info: ITeam[]
}>()

const infoStands = ref<ITeam[]>([]);

infoStands.value = [...props.info!];

function sortBy(elem: string, dir = 'asc'): void {
    if (dir === 'asc') {
        infoStands.value.sort((a: Record<string, any>, b: Record<string, any>,) => a[elem] - b[elem])
    } else {
        infoStands.value.sort((a: Record<string, any>, b: Record<string, any>,) => b[elem] - a[elem])
    }
}
</script>

<style scoped>

</style>