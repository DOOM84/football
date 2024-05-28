<template>
    <tr class="border-b border-solid border-zinc-800 border-opacity-10">
        <td class="text-center pt-1 px-2">
            {{ +ind + 1 }}
        </td>
        <td colspan="2" class="text-left pt-1 px-2">
            <div class="flex items-center gap-2">
                <img :alt="info.name" class="w-[30px] h-[30px]"
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                     :style="`background: url('/teams.png') ${info.sprite};`"/>

                <nuxt-link class="hover:underline overflow-hidden" v-if="info.slug" :to="'/team/'+info.slug">
                    {{ info.name }}
                </nuxt-link>
                <span class="overflow-hidden" v-else>
                {{ info.name }}
            </span>
            </div>
        </td>
        <td class="text-left pt-1 pl-[0.2rem]">
            {{ info.games }}
        </td>
        <td class="text-center pt-1 px-[0.5rem]">
            {{ info.points }}
        </td>
    </tr>
</template>

<script setup lang="ts">

import type {ITeam} from "~/types/interfaces";

const props = defineProps<{
  info: ITeam,
  ind: number | string,
}>()
</script>

<style scoped>

</style>