<template>
  <div v-if="!error" class="content-grid">
    <div class="column-left">
      <div class="carousel center">
        <ClientOnly>
          <TheSlides :slides="data.headlines"/>
        </ClientOnly>
      </div>
      <div class="column-left-content">
        <div class="positions">
          <TheTabsStands v-if="stands" :teams="stands.teams" />
        </div>
        <div class="posts-container">
        <ThePostsBase @newPost="newPost" @addPosts="addPosts" :posts="data.posts" />
        <ThePostsLoadMore @addPosts="addPosts" :disableWhen="50" :postsLength="data.posts.length" :limit="5"/>
        </div>
      </div>
    </div>
    <div class="column-right">
      <TheTabsResults v-if="results" :tour="results.tour" />
      <TheTabsScorers v-if="scorers" :players="scorers.players" />
    </div>
  </div>
</template>

<script setup>
const {$socket} = useNuxtApp();

const initInfo = useInitInfo();

const route = useRoute();

const {data, error, pending} = await useAsyncData('champ', () => $fetch('/api/champ',
    {params: {champ: route.params.champ, count:15}}), {initialCache: false})

if (error?.value) {
  throwError(error.value)
}


const stands = ref();
const scorers = ref();
const results = ref();

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - ' + (data.value?.champName ? data.value.champName : 'Чемпионат');
  }
})


onMounted(()=>{
  stands.value = initInfo.value.stands.filter( item => item.champ.slug === route.params.champ)[0];
  scorers.value = initInfo.value.scorers.filter( item => item.champ.slug === route.params.champ)[0];
  results.value = initInfo.value.results.filter( item => item.champ.slug === route.params.champ)[0];


  $socket.on("update-tour", (data) => {

    const ind = initInfo.value.results.findIndex(ch => ch.champ.slug === data.champ);

    if(ind > -1){
      initInfo.value.results[ind].tour = data.tour
    }

  });
})

function addPosts(posts) {
  data.value.posts.push(...posts)
}

function newPost(post) {
  data.value.posts.unshift(post);
}

onBeforeUnmount(()=>{
  $socket.removeAllListeners();
})


</script>