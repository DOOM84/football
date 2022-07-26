<template>
  <div v-if="!error" class="content-grid">
    <div class="column-left boxShadow">
      <div class="column-left-content">
        <div class="fullInfo">
          <TheArchive @resetSeason="loadActualSeason" @seasonLoaded="loadSeason" :mode="'ecupResults'"/>
          <template v-for="(info, group) in data.group">
            <TheTabsEcupGroupRes :tour="info">
              <thead>
              <tr>
                <th colspan="6" class="center pt-1 pb-1 info-group">
                  Группа {{ group }}
                </th>
              </tr>
              </thead>
            </TheTabsEcupGroupRes>
          </template>
          <template v-for="source in data.playOff">
            <TheTabsEcupPoRes :tour="source">
              <thead>
              <tr>
                <th colspan="6" class="center pt-1 pb-1 info-group">
                  {{ source.stage }}
                </th>
              </tr>
              </thead>
            </TheTabsEcupPoRes>
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
const {$socket} = useNuxtApp();

const initInfo = useInitInfo();

const route = useRoute();

const [{data, error}, {data: posts}] = await Promise.all([
  useAsyncData('ecup_results', () => $fetch('/api/ecup_results',
      {params: {ecup: route.params.ecup}}), {initialCache: false}),
  useAsyncData('ecup_posts', () => $fetch('/api/ecup_posts',
      {params: {ecup: route.params.ecup, count: 10}}), {initialCache: false}),
])


if (error?.value) {
  throwError(error.value)
}


function newPost(post) {
  posts.value.unshift(post);

  if (posts.value.length > 10) {
    posts.value.splice(-1);
  }
}


onMounted(() => {

  $socket.on("update-ecup", (res) => {

    if (route.params.ecup && route.params.ecup === res.ecup) {
      data.value.playOff = res.playOff;
      data.value.group = res.group;
    }

  });

})


const ecupName = computed(() => initInfo.value?.ecup_stands
    .filter(item => item.slug === route.params.ecup)[0]?.name || '');


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Календарь - ' + ecupName?.value;
  }
})


onBeforeUnmount(() => {
  $socket.removeAllListeners();
})


async function loadSeason(res) {

  try {

    data.value = res;

  } catch (e) {

    //console.log(e);

  }

}

async function loadActualSeason() {

  try {

    const results = await $fetch('/api/ecup_results', {params: {ecup: route.params.ecup}});

    data.value = {...results};

  } catch (e) {
    //console.log(e);
  }

}


</script>

<style scoped>
.info-group {
  background: black;
  color: white;
}

</style>