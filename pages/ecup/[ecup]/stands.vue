<template>
  <div class="content-grid">
    <div class="column-left boxShadow">
      <div class="column-left-content">
        <div class="fullInfo">
          <TheArchive @resetSeason="loadActualSeason" @seasonLoaded="loadSeason" :mode="'ecupStands'"/>
          <template v-if="table" v-for="(source, group) in table.stands">
            <TheTabsStands :teams="source.teams" :fullStands="true">
              <thead>
              <tr>
                <th class="center pl-1">#</th>
                <th class="center" colspan="2">Группа {{ group }}</th>
                <th class="center">
                  И
                </th>
                <th class="center">
                  В
                </th>
                <th class="center">
                  Н
                </th>
                <th class="center">
                  П
                </th>
                <th class="center">
                  З
                </th>
                <th class="center">
                  Пр
                </th>
                <th class="center">
                  Р
                </th>
                <th class="center">
                  О
                </th>
              </tr>
              </thead>
            </TheTabsStands>
          </template>

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

const table = ref();

const {data: posts, error, pending} = await useAsyncData('ecup_posts', () => $fetch('/api/ecup_posts',
    {params: {ecup: route.params.ecup, count: 10}}), {initialCache: false})

if (error?.value) {
  throwError(error.value)
}


onMounted(() => {
  table.value = {...initInfo.value.ecup_stands.filter(item => item.slug === route.params.ecup)[0]}

})


const ecupName = computed(()=> table.value ? table.value.name : '')


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Турнирные таблицы - ' + ecupName.value;
  }
})



function newPost(post) {
  posts.value.unshift(post);

  if (posts.value.length > 10) {
    posts.value.splice(-1);
  }
}


async function loadSeason(res) {

  try {

    table.value.stands = res;

  } catch (e) {

    //console.log(e);

  }

}

function loadActualSeason() {

  table.value = {...initInfo.value.ecup_stands.filter(item => item.slug === route.params.ecup)[0]};
}

</script>

<style lang="scss" scoped>
.fullInfo {
  th {
    background: black;
    color: white;
  }

}
</style>