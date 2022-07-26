<template>
  <div class="content-grid">

    <div class="column-left">
      <TheSinglePost/>
    </div>

    <div class="column-right">
      <TheTabsResults v-if="results" :tour="results.tour"/>
      <TheTabsStands v-if="stands" :teams="stands.teams"/>
      <ThePostsBase @newPost="newPost" :posts="champPosts" :showMore="true"/>
    </div>
  </div>

</template>

<script setup>
const {$socket} = useNuxtApp();

const initInfo = useInitInfo();

const route = useRoute();

const stands = ref();
const results = ref();

const {data: champPosts, error, pending} = await useAsyncData('champPosts', () => $fetch('/api/champ_posts',
    {params: {champ: route.params.champ, count: 10}}), {initialCache: false})


if (error?.value) {
  throwError(error.value)
}


onMounted(() => {
  stands.value = initInfo.value.stands.filter(item => item.champ.slug === route.params.champ)[0];
  results.value = initInfo.value.results.filter(item => item.champ.slug === route.params.champ)[0];

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

function newPost(post) {
  champPosts.value.unshift(post);

  if (champPosts.value.length > 10) {
    champPosts.value.splice(-1);
  }
}

</script>

<style lang="scss" scoped>
.column-left {
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  grid-row: 1;
  grid-column: 1/4;
}
</style>