<template>
  <tr class="border-b border-solid border-zinc-800 border-opacity-10">
    <td class="text-center pt-1 px-2">
      {{ +ind + 1 }}
    </td>
    <td colspan="2" class="text-left pt-1 px-2">
      <div class="flex items-center gap-2 min-w-[160px]">
        <img :alt="info.name" class="w-[30px] h-[30px]"
             src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
             :style="`background: url('/teams.png') ${info.sprite};`"/>

        <nuxt-link class="hover:underline " v-if="info.slug" :to="'/team/'+info.slug">
          {{ info.name }}
        </nuxt-link>
        <span class="" v-else>
                {{ info.name }}
            </span>
      </div>
    </td>
    <td class="text-center">
      {{ info.games }}
    </td>
    <td class="text-center">
      {{ info.win }}
    </td>
    <td class="text-center">
      {{ info.draw }}
    </td>
    <td class="text-center">
      {{ info.lost }}
    </td>
    <td class="text-center">
      {{ info.goals }}
    </td>
    <td class="text-center">
      {{ info.missed }}
    </td>
    <td class="text-center">
      {{ info.diff }}
    </td>
    <td class="text-center">
      {{ info.points }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import type {ITeam} from "~/types/interfaces";

const props = defineProps<{
  ind: number | string,
  info: ITeam,
}>()

</script>

<style scoped>

</style>