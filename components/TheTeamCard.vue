<template>
    <div class="py-2">
      <nuxt-link :to="'/team/'+team.slug">
        <div class="w-[250px] text-center">
          <div class="flex justify-center">
            <img class="max-w-[150px]" :src="team.img" alt="">
          </div>
          <div class="pl-1 pb-1">
              <div class="text-center  px-4 text-xl">{{ team.name }}</div>
          </div>
        </div>
      </nuxt-link>
    </div>
</template>

<script setup lang="ts">
import type {ITeam} from "~/types/interfaces";

const props = defineProps<{
  team: ITeam,
}>()
</script>

<style scoped>

</style>