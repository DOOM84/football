<template>
  <div class="content-box bg-white searchBox">
    <h3 class="pl-1">Поиск: <em>{{ term }}</em></h3>
    <h3 class="pl-1">Найдено новостей: {{ searchResult.posts.count }}</h3>
    <div class="row-content">
      <template v-for="post in searchResult.posts.results">
        <ThePostCard :post="post" :mWidth="250"/>
      </template>
      <div class="w100">
        <button
            :disabled="+searchResult.posts.results.length >= +searchResult.posts.count"
            v-if="searchResult.posts.results.length >= 28"
            @click.prevent="loadMore($event, 'posts')"
            id="showMore"
            class="pointer load-more w100">
          Загрузить еще <i class="d-none fas fa-circle-notch fa-spin"></i>
        </button>
      </div>
    </div>

    <h3 class="pl-1">Найдено игроков: {{ searchResult.players.count }}</h3>
    <div class="row-content">
      <template v-for="player in searchResult.players.results">
        <ThePlayerCard :showTeam="true" :player="player"/>
      </template>
      <div class="w100">
        <button
            :disabled="+searchResult.players.results.length >= +searchResult.players.count"
            v-if="searchResult.players.results.length >= 28"
            @click.prevent="loadMore($event, 'players')"
            id="showMore"
            class="pointer load-more w100">
          Загрузить еще <i class="d-none fas fa-circle-notch fa-spin"></i>
        </button>
      </div>
    </div>

    <h3 class="pl-1">Найдено команд: {{ teams.length }}</h3>
    <div class="row-content">
      <template v-for="team in teams">
        <TheTeamCard :team="team"/>
      </template>
    </div>
  </div>
</template>
<script setup>
import {onMounted} from "vue";

const searchResult = useResult();

const term = useTerm();

const initInfo = useInitInfo();

const route = useRoute();

const teams = ref([]);

async function loadMore(e, category) {

  if (+searchResult.value[category].results.length >= +searchResult.value[category].count) {
    return
  }

  e.target.children[0].classList.toggle('d-none');

  const results = await $fetch('/api/search', {
    params:
        {
          category: category,
          term: term.value,
          offset: searchResult.value[category].results.length,
          limit: 8
        }
  });

  searchResult.value[category].results.push(...results);

  e.target.children[0].classList.toggle('d-none');
}

onMounted(() => {
  if (term.value) {
    searchTeams()
  }
})

watch(term, () => {
  if (term.value) {
    searchTeams()
  }

})

watch(route, () => {
  searchResult.value = {
    posts: {results: [], count: 0},
    players: {results: [], count: 0},
  };
  term.value = null;
})


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Поиск - ' + (term.value ? term.value : '');
  }
})


function searchTeams() {
  teams.value = [];

  for (let i = 0; i < initInfo.value.stands.length; i++) {

    const filteredTeams = initInfo.value.stands[i].teams.filter((team) => {
      return team.name.toLowerCase().includes(term.value.toLowerCase())
          || team.slug.toLowerCase().includes(term.value.toLowerCase())
    }).map(team => ({
      name: team.name,
      slug: team.slug,
      img: team.img
    }))

    teams.value.push(...filteredTeams)
  }
}


</script>

<style lang="scss" scoped>

.searchBox {
  min-height: 85vh;
}

.load-more {
  position: relative;
  height: 36px;
  min-width: 64px;
  padding: 0 16px;
  background: transparent;
  color: #1976d2;
  border: 1px #1976d2 solid;
  font-size: .875rem;
  text-transform: uppercase;
  font-weight: 600;
  transition: all .2s cubic-bezier(.4, 0, .6, 1);
  margin-top: 5px;
  margin-bottom: 5px;

  &:hover {
    background: rgba(25, 118, 210, 0.05);
  }


  &:active {
    background: rgba(25, 118, 210, 0.2);
    opacity: 1;
    transition: 0.2s
  }

}

.content-grid {
  grid-template-columns: 32% 1fr;
}

@media(max-width: 1000px) {
  /*.row-content{
    justify-content: center;
  }*/

  .content-box {
    margin-top: 60px;
  }
}

</style>