<template>
  <div>
    <div id="modals"></div>
    <AdminModalWrap @closeDlg="closeModal" mWidth="400px" :showDlg="showModal">
      <TheAuth/>
    </AdminModalWrap>
    <TheHeader/>
    <div class="grid" id="top" style="min-height: calc(100vh - 175px)">
      <article>
        <slot/>
      </article>
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
const navToggle = useNavToggle();

const showModal = useAuth();

const route = useRoute();

const initInfo =  useInitInfo()

await loadInitInfo();

if(process.client){
  if(!initInfo.value.stands){
    await loadInitInfo();
  }
}

useMeta({
  script: [{
    defer: true,
    async: true,
    src: 'http://platform.twitter.com/widgets.js',
  }]
})

async function loadInitInfo(){

  const [{ data: stands},
    { data: results },
    { data: scorers },
    { data: ecup_stands },
    { data: seasons }   ] = await Promise.all([
    useFetch('/api/stands'),
    useFetch('/api/tourResults'),
    useFetch('/api/scorers'),
    useFetch('/api/ecup_stands'),
    useFetch('/api/seasons'),
  ])

  initInfo.value.stands = stands.value;
  initInfo.value.results = results.value;
  initInfo.value.scorers = scorers.value;
  initInfo.value.ecup_stands = ecup_stands.value;
  initInfo.value.seasons = seasons.value;
}

watch(route, () => {
  navToggle.value = false;
})

const bodyBg = computed(()=> route.params.ecup === 'lch'
|| route.params.ecup === 'le' || route.params.ecup === 'lconf' ? route.params.ecup + '_bg' : 'bg')

useHead({
  bodyAttrs: {
    id: bodyBg
  }
})

function closeModal() {
  showModal.value = false;
}


</script>

<style lang="scss" scoped>

</style>