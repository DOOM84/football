<template>
  <div v-if="!error" class="content-box bg-white tagBox">
    <h3 class="pl-1">Новости по тегу: {{ data.tag.name }}</h3>
    <div class="row-content">
      <template v-for="post in data.posts">
        <ThePostCard :post="post" :mWidth="280"/>
      </template>

      <ThePostsLoadMore @addPosts="addPosts"
                        :showRest="true"
                        :initialLength="28"
                        :postsLength="data.posts.length" :limit="8"/>

    </div>
  </div>
</template>

<script setup>
const route = useRoute();

const {data, error, pending} = await useAsyncData('tag',
    () => $fetch('/api/tag', {params: {slug: route.params.tag}}), {initialCache: false});

if (error?.value) {
  throwError(error.value)
}


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Тег - ' + (data.value?.tag.name ? data.value.tag.name : '');
  }
})


function addPosts(loadedPosts) {

  data.value.posts.push(...loadedPosts)
}


</script>

<style lang="scss" scoped>

.tagBox {
  min-height: 85vh;
}

.content-grid {
  grid-template-columns: 32% 1fr;
}

@media(max-width: 1000px) {

  .content-box {
    margin-top: 60px;
  }
}

</style>