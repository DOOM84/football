<template>
        <nuxt-link  :active-class="'none'" :exact-active-class="'none'" :to="postUrl">
            <div class="py-2 px-2 border-b border-solid border-zinc-800 border-opacity-10">
            <div class="inline-block w-full pr-5">
                <img class="w-[150px] float-left mr-3 pb-1"
                     :src="post.img.thumbnail" alt="">
                <div class="leading-5">
                    {{ post.title }}
                </div>
            </div>
            <div class="text-right pr-1">
                <small class="text-zinc-400">
                    {{ $postDate(+post.date) }}
                </small>
            </div>
            </div>
        </nuxt-link>


</template>

<script lang="ts" setup>

import type {IPost} from "~/types/interfaces";

const {$postDate} = useNuxtApp();

const props = defineProps<{
  post: IPost
}>()

const postUrl = computed(() => {
  return props.post.ecup ? '/ecup/' + props.post.ecup.slug + '/' + props.post.slug : '/' + props.post.champ.slug + '/' + props.post.slug
})

</script>

<style lang="scss" scoped>

</style>