<template>
  <div>
    <ClientOnly>
      <TheLoading :show-load="showLoading" />
    </ClientOnly>
    <ClientOnly>
      <Multiselect
          v-model="season"
          :options="fullSeasons"
          @select="loadSeason"
          @clear="loadActualSeason"
          placeholder="Выберите сезон"></Multiselect>
    </ClientOnly>
  </div>

</template>


<script lang="ts" setup>
import Multiselect from '@vueform/multiselect';

import {fullSeasons} from "~/utils/archive";

const route = useRoute();

const season = ref<string | number>('');

//const seasons = ref([2022,2023]);

const showLoading = ref<boolean>(false);

/*const props = defineProps({
  mode: {type: String, default: ''},
})*/

const props = withDefaults(defineProps<{
  mode: string;
}>(), {
  mode: '',
})

const emit = defineEmits(['seasonLoaded', 'resetSeason'])


async function loadSeason(): Promise<void> {

  try {

    showLoading.value = true;

    const res = await $fetch('/api/loadSeason', {
      params: {
        season: season.value.toString().slice(-2), mode: props.mode,
        champ: route.params.champ, ecup: route.params.ecup, cup: route.params.cup
      }
    });

   emit('seasonLoaded', res, season.value.toString().slice(-2));

  } catch (e) {

    console.log(e);

  }finally {
    showLoading.value = false;
  }

}

function loadActualSeason(): void {

  emit('resetSeason');

}


</script>