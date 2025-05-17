<template>
    <div>
      <vueper-slides
          lazy
          :breakpoints="{ 600: {arrows: false, bulletsOutside: false }}"
          autoplay
          :slideRatio="1 / 2"
          :dragging-distance="150"
          fixed-height="473px"
          fade>
        <vueper-slide
            v-for="(post, i) in props.headlines"
            :key="i"
            :image="post.img?.original"
        >
          <template #content>
            <div
                class="text-white absolute bg-zinc-900 bg-opacity-30 p-4 bottom-[10%] w-full text-left text-[1.5rem] leading-8">
              <nuxt-link class="text-white"
                         :to="post.ecup ? '/ecup/' + post.ecup.slug + '/' + post.slug : '/' + post.champ?.slug + '/' + post.slug">
                {{ post.title }}
              </nuxt-link>
            </div>
          </template>
        </vueper-slide>
      </vueper-slides>
    </div>
</template>

<script setup lang="ts">
import type {IPost} from "~/types/interfaces";

const props = defineProps<{
  headlines: IPost[]
}>()
</script>

<style scoped>

</style>