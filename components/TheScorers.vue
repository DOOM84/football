<template>
    <tr class="border-b border-solid border-zinc-800 border-opacity-10">
        <td colspan="2" class="text-left pt-1 px-2">
            <div class="flex items-center gap-2">
                <img v-if="player.team?.name" class="w-[30px] h-[30px]" :alt="player.team.name" :title="player.team.name"
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                     :style="`
             background: url('/teams.png') ${player.team.sprite};`"/>

              <img v-else class="w-[30px] h-[30px]" alt="team" :title="player.name"
                   :src="'/no_team.png'"
              />

                <nuxt-link v-if="player.slug" class="hover:underline overflow-x-hidden" :to="'/player/'+player.slug">
                    {{htmlDec(player.name)}}
                </nuxt-link>

              <span v-else class="overflow-x-hidden">
                {{htmlDec(player.name)}}
              </span>

              <img class="w-[30px] h-[30px]" :alt="player.name" :title="player.name"
                                  :src="player.img || '/no_player.png'"
                                  />
            </div>
        </td>
        <td class="text-center pt-1">
            {{ player.goals }}
        </td>
    </tr>
</template>

<script lang="ts" setup>
import type {IPlayer} from "~/types/interfaces";
import htmlDec from "~/helpers/htmlDec";

const props = defineProps<{
  player: IPlayer
}>()


</script>

<style lang="scss" scoped>



</style>