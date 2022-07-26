<template>
  <nuxt-link :to="post.champ ? '/'+post.champ+'/'+post.slug : '/ecup/' + post.ecup +'/'+post.slug">
    <div class="row-item" :style="{maxWidth: mWidth+'px'}">
      <img class="w100" :src="post.images.original" alt="">
      <div class="pl-1 pb-1 pr-1 right">
        <div class="right addInfo">{{$postDate(post.date)}} <span>{{post.champ_name || post.ecup_name}}</span></div>
        <div class="mt-1 left post-name">{{post.title}}</div>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup>

const {$postDate} = useNuxtApp();

const props = defineProps({
  post: {type: Object, default: {}},
  mWidth: {type: Number, default: 250},
})
</script>

<style lang="scss">

.addInfo{
  font-size: .75rem;

  span{
    color: #f44336;
  }
}



</style>