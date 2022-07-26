<template>
  <ClientOnly>
    <Multiselect
        v-model="season"
        :options="initInfo.seasons"
        @select="loadSeason"
        @clear="loadActualSeason"
        placeholder="Выберите сезон"></Multiselect>
  </ClientOnly>
</template>


<script setup>
import Multiselect from '@vueform/multiselect';

const {$showToast} = useNuxtApp();

const route = useRoute();

const season = ref(null);

const initInfo = useInitInfo();

const props = defineProps({
  mode: {type: String, default: ''},
})

const emit = defineEmits(['seasonLoaded', 'resetSeason'])


async function loadSeason() {

  try {

    $showToast('Обработка...', 'info', 2000);

    let res;

    res = await $fetch('/api/load_season', {
      params: {
        season: season.value, mode: props.mode, champ: route.params.champ, ecup: route.params.ecup
      }
    });

    emit('seasonLoaded', res);

  } catch (e) {

    //console.log(e);

  }

}

function loadActualSeason() {
  $showToast('Обработка...', 'info', 2000);

  emit('resetSeason');

}


</script>