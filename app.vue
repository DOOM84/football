<template>
  <div>
    <div v-if="loading" class="fixed z-[9999] top-0 left-0 w-full h-full bg-neutral-700/60 flex">
      <div class="flex m-auto text-neutral-300">
        <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
      </div>
    </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type {IChampDB, IEcupDB} from "~/types/interfaces";
const loading = ref(true);
const cups = useCups();

await callOnce(async () => {
    cups.value = await $fetch<{
      champs: IChampDB[]; ecups: IEcupDB[]
    }>('/api/init');

})

onMounted(()=>{
  if(loading.value){
    if(cups.value.champs.length || cups.value.ecups.length){
      loading.value = false;
    }
  }
})

</script>
