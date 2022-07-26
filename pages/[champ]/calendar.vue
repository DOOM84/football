<template>
  <div v-if="error || pending">
    <i class="fas center fa-circle-notch fa-spin fa-3x grey"></i>
  </div>
  <div v-else class="content-grid">
    <div class="column-left boxShadow">
      <div class="column-left-content">
        <div class="fullInfo">
          <TheArchive @resetSeason="loadActualSeason" @seasonLoaded="loadSeason" :mode="'champResults'"/>
          <TheTabsResults :full-calendar="true" :results="data.calendar.results"/>
        </div>

      </div>
    </div>
    <div class="column-right">
      <ThePostsBase @newPost="newPost" :posts="data.champPosts" :showMore="true"/>
    </div>
  </div>
</template>

<script setup>

const route = useRoute();

const {data, error, pending} = await useAsyncData('calendar', () => $fetch('/api/calendar',
    {params: {champ: route.params.champ}}), {initialCache: false})

if (error?.value) {
  throwError(error.value)
}

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Календарь - ' + (data.value?.champName ? data.value.champName : '');
  }
})

function newPost(post) {
  data.value.champPosts.unshift(post);

  if (data.value.champPosts.length > 10) {
    data.value.champPosts.splice(-1);
  }
}


async function loadSeason(res) {

  try {

    data.value.calendar.results = res;

  } catch (e) {

    //console.log(e);

  }

}

async function loadActualSeason() {

  try {

    const {results} = await $fetch('/api/results', {params: {champ: route.params.champ}});

    data.value.calendar.results = results;

  } catch (e) {
   // console.log(e);
  }

}

</script>