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
          <template v-if="table" v-for="(source, group) in table.stands">
            <TheTabsStands :teams="source.teams">
              <thead>
              <tr>
                <th class="center pl-1">#</th>
                <th class="center" colspan="2">Группа {{ group }}</th>
                <th class="center">И</th>
                <th class="center">О</th>
              </tr>
              </thead>
            </TheTabsStands>
          </template>
        </div>
        <div class="posts-container">
          <ThePostsBase @newPost="newPost" @addPosts="addPosts" :posts="data.posts"/>
          <ThePostsLoadMore @addPosts="addPosts" :disableWhen="50" :postsLength="data.posts.length" :limit="5"/>
        </div>
      </div>
    </div>
    <div class="column-right">
      <TheTabsBase v-if="Object.keys(data.playOff).length > 0" :dataId="'ecuppo_res'" :sources="data.playOff"/>
      <TheTabsBase v-if="Object.keys(data.group).length > 0" :dataId="'ecupgr_res'" :sources="data.group"/>
    </div>
  </div>
</template>

<script setup>
const {$socket} = useNuxtApp();

const route = useRoute();

const initInfo = useInitInfo();

const {data, error, pending} = await useAsyncData('ecup', () => $fetch('/api/ecup',
    {params: {ecup: route.params.ecup, count: 15}}), {initialCache: false})

if (error?.value) {
  throwError(error.value)
}

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Еврокубки - ' + (data.value?.ecupName ? data.value.ecupName : '');
  }
})

function addPosts(posts) {
  data.value.posts.push(...posts)
}

function newPost(post) {
  data.value.posts.unshift(post);
}

const table = ref();

onMounted(() => {

  table.value = initInfo.value.ecup_stands.filter(item => item.slug === route.params.ecup)[0];


  $socket.on("update-ecup", (res) => {

    if (route.params.ecup && route.params.ecup === res.ecup) {
      data.value.playOff = res.playOff;
      data.value.group = res.group;
    }

  });

})


onBeforeUnmount(() => {
  $socket.removeAllListeners();
})

</script>

<style lang="scss" scoped>
.positions {
  th {
    background: black;
    color: white;
  }
}
</style>