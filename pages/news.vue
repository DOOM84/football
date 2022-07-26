<template>
  <div class="content-box bg-white">
    <h3 class="pl-1">Все новости</h3>
    <div class="row-content">
      <template v-for="post in posts">
        <ThePostCard :post="post" :mWidth="280"/>
      </template>

      <ThePostsLoadMore @addPosts="addPosts" :showRest="false"
                        :initialLength="28" :postsLength="posts.length" :limit="8"/>

    </div>
  </div>
</template>

<script setup>
const {$postDate} = useNuxtApp();

const {data: posts, error, pending} = await useAsyncData('news',
    () => $fetch('/api/posts'), {initialCache: false})

function addPosts(loadedPosts) {

  posts.value.push(...loadedPosts)
}

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Новости';
  }
})


</script>

<style lang="scss" scoped>

.content-grid {
  grid-template-columns: 32% 1fr;
}

@media(max-width: 1000px) {
  .content-box {
    margin-top: 60px;
  }
}

</style>