<template>
  <div class="content-grid">
    <div class="column-left">
      <div class="carousel center">
        <ClientOnly>
          <TheSlides :slides="data.headlines"/>
        </ClientOnly>
      </div>
      <div class="column-left-content">
        <TheTabsBase dataId="stands" :sources="initInfo.stands"/>
        <div class="posts-container">
          <ThePostsBase @newPost="newPost" @addPosts="addPosts" :posts="data.posts"/>
          <ThePostsLoadMore @addPosts="addPosts" :disableWhen="50" :postsLength="data.posts.length" :limit="5"/>
        </div>

      </div>
    </div>
    <div class="column-right">

      <TheTabsBase dataId="results" :sources="initInfo.results"/>

      <TheTabsBase :classes="'mt-1'" dataId="scorers" :sources="initInfo.scorers"/>

      <template v-for="ecup in initInfo.ecup_stands">
        <div v-if="ecup && Object.keys(ecup.stands).length > 0">
          <div class="mt-1 cup-title">{{ ecup.name }}</div>
          <TheTabsBase :dataId="'stands-'+ecup.slug" :sources="ecup.stands" :tabHead="'group'"/>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
const {$socket} = useNuxtApp();

const {data, error, pending} = await useAsyncData('main', () => $fetch('/api/main'), {initialCache: false})

const initInfo = useInitInfo();

function addPosts(posts) {
  data.value.posts.push(...posts)
}

function newPost(post) {
  data.value.posts.unshift(post);
}

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk;
  }
})


onMounted(() => {

  $socket.on("update-tour", (data) => {

    const ind = initInfo.value.results.findIndex(ch => ch.champ.slug === data.champ);

    if (ind > -1) {
      initInfo.value.results[ind].tour = data.tour
    }

  });

})

onBeforeUnmount(() => {
  $socket.removeAllListeners();
})


</script>

<style lang="scss" scoped>
</style>