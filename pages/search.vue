<template>
  <div>
    <div class="p-4">Поиск: <em>{{ term }}</em></div>
    <div v-if="searchLoad"
         class="col-span-3 text-center pt-10">
      <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
    </div>
    <template v-if="searchResult.posts.count">
      <div class="p-4">Найдено новостей: {{ searchResult.posts.count }}</div>
      <div class="px-1 mt-4 flex flex-wrap text-center justify-center gap-4 ">
        <ThePostsCard :post="post" :m-width="+280" v-for="post in searchResult.posts.results" :key="post.slug"/>
      </div>
      <div class="p-4 mt-3">
        <TheLoadMore :show-load="showLoad" :search="true" @addSearchResults="loadMore('posts')" :my="0"/>
      </div>
    </template>

    <template v-if="searchResult.players.count">
      <div class="p-4">Найдено игроков: {{ searchResult.players.count }}</div>
      <div class="px-1 mt-4 flex flex-wrap text-center justify-center gap-4 ">
        <div v-for="player in searchResult.players.results" :key="player.slug" class="shadow-md shadow-zinc-800/20">
          <ThePlayerCard :show-team="true" :player="player"/>
        </div>
      </div>
      <div class="p-4 mt-3">
        <TheLoadMore :show-load="showLoad" :search="true" @addSearchResults="loadMore('players')" :my="0"/>
      </div>
    </template>

    <template v-if="searchResult.teams.count">
      <div class="p-4">Найдено команд: {{ searchResult.teams.count }}</div>
      <div class="px-1 mt-4 flex flex-wrap text-center justify-center gap-4 ">
        <div v-for="team in searchResult.teams.results" :key="team.slug" class="shadow-md shadow-zinc-800/20">
          <TheTeamCard :team="team"/>
        </div>
      </div>
      <div class="p-4 mt-3">
        <TheLoadMore :show-load="showLoad" :search="true" @addSearchResults="loadMore('teams')" :my="0"/>
      </div>
    </template>
  </div>

</template>

<script setup lang="ts">
const searchResult = useResult();

const searchLoad = useSearchLoad();

const term = useTerm();

const title = computed(()=> 'Новости европейского футбола - Поиск' + (!term.value ? '' : ' - ' +term.value) )

useSeoMeta({
  title: () => title.value,
});

/*useHead({
  titleTemplate: '%s'+' - Поиск - '+ aaa(),
 // titleTemplate: '%s - Site Title',
  /!*titleTemplate: (titleChunk) => {
    return `%s - Поиск - ${term.value}`;
  }*!/
})*/

const showLoad = ref<boolean>(false);


async function loadMore(category: 'posts' | 'teams' | 'players') {

  if (+searchResult.value[category].results.length >= +searchResult.value[category].count) {
    return
  }
  try {

    showLoad.value = true;
    const results = await $fetch<any[]>('/api/search', {
      params:
          {
            category: category,
            term: term.value,
            offset: searchResult.value[category].results.length,
            limit: 8
          }
    });

    searchResult.value[category].results.push(...results);
  } catch (e) {

  } finally {
    showLoad.value = false;
  }
}

onUnmounted(() => {
  searchResult.value = {
    posts: {results: [], count: 0},
    players: {results: [], count: 0},
    teams: {results: [], count: 0},
  };
  term.value = null;
})


</script>

<style scoped>

</style>