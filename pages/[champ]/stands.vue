<template>
  <div class="content-grid">
    <div class="column-left boxShadow">
      <div class="column-left-content">
        <div class="fullInfo">

          <TheArchive @resetSeason="loadActualSeason" @seasonLoaded="loadSeason" :mode="'champStands'"/>

          <TheTabsStands v-if="stands" :teams="stands.teams" :fullStands="true">
            <thead>
            <tr>
              <th class="center pl-1">#</th>
              <th class="center" colspan="2">Команда</th>
              <th class="center">
                <div class="d-flex stands-title">
                  И
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('games', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('games', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  В
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('win', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('win', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  Н
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('draw', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('draw', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  П
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('lost', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('lost', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  З
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('goals', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('goals', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  Пр
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('missed', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('missed', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  Р
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('diff', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('diff', 'desc')"></i>
                  </div>
                </div>
              </th>
              <th class="center">
                <div class="d-flex stands-title">
                  О
                  <div class="d-flex flexColumn">
                    <i class="fas fa-caret-up pointer" @click.self="sortBy('points', 'asc')"></i>
                    <i class="fas fa-caret-down pointer" @click.self="sortBy('points', 'desc')"></i>
                  </div>
                </div>
              </th>
            </tr>
            </thead>
          </TheTabsStands>
        </div>

      </div>
    </div>
    <div class="column-right">
      <ThePostsBase @newPost="newPost" :posts="posts" :showMore="true"/>
    </div>
  </div>
</template>

<script setup>

const route = useRoute();

const initInfo = useInitInfo();

const stands = ref();

const {data: posts, error, pending} = await useAsyncData('champ_posts', () => $fetch('/api/champ_posts',
    {params: {champ: route.params.champ, count: 10}}), {initialCache: false})

onMounted(() => {
  stands.value = JSON.parse(JSON.stringify(initInfo.value.stands
      .filter(item => item.champ.slug === route.params.champ)[0]));

})

const champName = computed(()=> stands.value ? stands.value.champ.name : '')


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Турнирная таблица - ' + champName.value;
  }
})


function newPost(post) {
  posts.value.unshift(post);

  if (posts.value.length > 10) {
    posts.value.splice(-1);
  }
}


function sortBy(elem, dir = 'asc') {
  if (dir === 'asc') {
    stands.value.teams.sort((a, b) => a[elem] - b[elem])
  } else {
    stands.value.teams.sort((a, b) => b[elem] - a[elem])
  }
}


async function loadSeason(res) {

  try {

    stands.value.teams = res;

  } catch (e) {

    //console.log(e);

  }

}

function loadActualSeason() {

  stands.value = JSON.parse(JSON.stringify(initInfo.value.stands
      .filter(item => item.champ.slug === route.params.champ)[0]));
}

</script>

<style lang="scss" scoped>
.stands-title {
  font-size: 12px;

  justify-content: center;
  align-items: center;
  gap: 3px
}

.fullInfo {
  th {
    color: #5c5c5c;
  }

}
</style>