<template>
  <nuxt-link :active-class="'none'" :exact-active-class="'none'" :to="postUrl">
    <div class="post-small">
      <img class="post-pic-thumb"
           :src="post.images.thumbnail" alt="">
      <div class="post-small-title">
        {{ post.title }}
      </div>
    </div>
    <div class="right">
      <small class="postDate">
        {{ $postDate(post.date) }}
      </small>
    </div>
  </nuxt-link>
</template>

<script setup>

const {$postDate} = useNuxtApp();


const props = defineProps({
  post: {type: Object, default: {}},
})

const postUrl = computed(() => {
  return props.post.ecup ? '/ecup/' + props.post.ecup + '/' + props.post.slug : '/' + props.post.champ + '/' + props.post.slug
})

</script>

<style lang="scss" scoped>
.post-small {
  display: inline-block;
  width: 100%;

  .post-pic-thumb {
    width: 150px;
    float: left;
    margin-right: 1rem;
    padding-bottom: 8px
  }

  .post-small-title {
    line-height: 1.35rem;
  }
}

.postDate {
  color: #9e9e9e;
}

</style>