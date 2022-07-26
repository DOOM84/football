<template>
  <div class="content-grid">
    <div class="column-left">
      <TheSinglePost />
    </div>
    <div v-if="!error" class="column-right">

      <TheTabsBase v-if="table && Object.keys(table.stands).length > 0" :dataId="'stands-'+table.slug"
                   :sources="table.stands" :tabHead="'group'"  />

      <TheTabsBase v-if="Object.keys(data.playOff).length > 0" :dataId="'ecuppo_res'" :sources="data.playOff"/>

      <TheTabsBase v-if="Object.keys(data.group).length > 0" :dataId="'ecupgr_res'" :sources="data.group"/>

      <ThePostsBase @newPost="newPost" :posts="ecupPosts" :showMore="true" />
    </div>
  </div>

</template>

<script setup>
const {$socket} = useNuxtApp();

const initInfo = useInitInfo();

const route = useRoute()

const table = ref();


const [{ data, error }, { data: ecupPosts }] = await Promise.all([
  useAsyncData('ecup_results', () => $fetch('/api/ecup_results',
      {params: {ecup: route.params.ecup}}), {initialCache: false}),
  useAsyncData('ecup_posts', () => $fetch('/api/ecup_posts',
      {params: {ecup: route.params.ecup, count:10}}), {initialCache: false}),
])


if (error?.value) {
  throwError(error.value)
}


function newPost(post) {
  ecupPosts.value.unshift(post);

  if(ecupPosts.value.length > 10){
    ecupPosts.value.splice(-1);
  }
}

onMounted(()=>{

  table.value = initInfo.value.ecup_stands.filter( item => item.slug === route.params.ecup)[0];

  $socket.on("update-ecup", (res) => {

    if(route.params.ecup && route.params.ecup === res.ecup){
      data.value.playOff = res.playOff;
      data.value.group = res.group;
    }

  });

})



onBeforeUnmount(()=>{
  $socket.removeAllListeners();
})




</script>

<style lang="scss" scoped>
.column-left{
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  grid-row: 1;
  grid-column: 1/4;
}
</style>