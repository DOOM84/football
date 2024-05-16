<template>
    <div class="py-2">
      <nuxt-link :to="'/player/'+player.slug">
        <div class="w-[250px] text-center">

          <div class="flex justify-center">
            <img @error="imageUrlAlt" class="max-w-[150px]" :src="player.img" alt="">
          </div>


          <div class="pl-1 pb-1">

              <div class="text-center px-4 text-2xl">{{ htmlDec(player.name) }}</div>

            <div class="flex justify-between pl-4 pr-5">
              <div v-if="player.position">
                {{ player.position }}
              </div>
              <template v-if="showTeam">
                <div v-if="player.team">
                  <img :title="player.team.name" :alt="player.team.name" class="w-[30px] h-[30px]"
                       src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                       :style="`background: url('/teams.png') ${player.team.sprite};`"/>
                </div>
                <div v-else>
                  <img :title="'Нет/другое'" class="w-[30px] h-[30px]"
                       src="/no_team.png" />
                </div>
              </template>
            </div>
            </div>
          </div>
      </nuxt-link>
      <div>
        <slot></slot>
      </div>
    </div>
</template>

<script setup lang="ts">
import type {IPlayer} from "~/types/interfaces";

const props = withDefaults(defineProps<{
  player: IPlayer;
  showTeam?: boolean,
}>(), {
  showTeam: false,
})

function imageUrlAlt(event: Event): void {
 // event.target.src = "/no_player.png"
  (event.target as HTMLImageElement).src = "/no_player.png";
}

function htmlDec(str: string): string{
  return  str.replace("&apos;", "'").replace("&quot;", '"').replace("&ndash;", "-").replace("&mdash;", '—')
}
</script>

<style scoped>

</style>