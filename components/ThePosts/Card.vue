<template>
    <div class="shadow-md shadow-zinc-800/20" :style="{width: mWidth+'px'}">
        <nuxt-link :to="post?.champ ? '/'+post.champ.slug+'/'+post.slug : '/ecup/' + post.ecup?.slug +'/'+post.slug">
            <img class="w-full" :src="post?.img.original" alt="">
            <div class="pl-1 pb-1 pr-1 text-right">
                <div class="text-right text-xs text-zinc-600">
                    {{$postDate(+post.date)}} <span class="text-red-600">{{post.champ?.name || post.ecup?.name}}</span></div>
                <div class="mt-1 text-left px-4">{{post.title}}</div>
            </div>
        </nuxt-link>
    </div>
</template>

<script setup lang="ts">
import type {IPost} from "~/types/interfaces";

const {$postDate} = useNuxtApp();

const props = withDefaults(defineProps<{
  post: IPost;
  mWidth?: number,
}>(), {
  mWidth: 250,
})



</script>

<style scoped>

</style>