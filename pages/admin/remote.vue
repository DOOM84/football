<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Обновление через api
    </h1>

    <h1 class="mt-2 center pb-1 mb-2 pl-2 pr-2 admin-title">
      Чемпионаты
    </h1>

    <div class="d-flex f-wrap g-1 justify-end">
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="stands">
         Турнирные таблицы всех чемпионатов
      </button>
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="results">
         Все результаты чемпионата
      </button>

      <button
          type="button"
          class="button btn-dark"

          @click.prevent="tourResults">
         Результаты тура чемпионата
      </button>

      <button
          type="button"
          class="button btn-dark"

          @click.prevent="scorers">
         Бомбардиры всех чемпионатов
      </button>
    </div>

    <div class="d-flex mt-2 justify-center items-center g-1">
      <label for="allChampsTour">Обновлять результаты тура всех чемпионатов каждые 60 сек.</label>
      <input type="checkbox" class="check" v-model="intervalUpdate" id="allChampsTour">
    </div>

    <div class="form-group mt-2">
      <label>Чемпионат</label>
      <Multiselect
          v-model="champ"
          :options="data.champs"
          :searchable="true"
          valueProp="slug"
          label="name"
          :object="true"
          @change="champChanged"
          placeholder="Выберите чемпионат"></Multiselect>
    </div>

    <h1 class="mt-3 center pb-1 mb-3 admin-title">
      Еврокубки
    </h1>


    <div class="d-flex mb-2 justify-center items-center g-1">
      <label for="ecupUpdate">Обновлять результаты еврокубка каждые 60 сек.</label>
      <input type="checkbox" class="check" v-model="intervalEcupUpdate" id="ecupUpdate">
    </div>


    <div class="d-flex f-wrap g-1 justify-end">
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="ecupStands">
         Турнирные таблицы еврокубка
      </button>
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="ecupResults">
         Результаты еврокубка
      </button>

    </div>

    <div class="form-group mt-2">
      <label>Еврокубок</label>
      <Multiselect
          v-model="ecup"
          :options="data.ecups"
          :searchable="true"
          valueProp="slug"
          label="name"
          :object="true"
          @change="ecupChanged"
          placeholder="Выберите еврокубок"></Multiselect>
    </div>
  </main>
</template>
<script setup>
import {ref} from 'vue';
import Multiselect from '@vueform/multiselect';
import {useRouter} from 'vue-router';

const {$showToast, $socket} = useNuxtApp();

definePageMeta({
  layout: 'admin'
})

const router = useRouter();

const champ = ref({});

const ecup = ref({});

const tUpdate = ref(null);

const ecupUpdate = ref(null);

const intervalUpdate = ref(false);

const intervalEcupUpdate = ref(false);

const {data, error} = await useAsyncData('adminRemote',
    () => $fetch('/api/admin/remote'),  {initialCache: false});


watch(intervalUpdate, () => {

  if (intervalUpdate.value) {

    $showToast('Обновление включено', 'info', 2000);
    allChampsTourResults();

  }else{

    if(tUpdate.value){
      clearInterval(tUpdate.value);
      $showToast('Обновление отключено', 'info', 2000);
    }
  }
})


watch(intervalEcupUpdate, () => {

  if (intervalEcupUpdate.value) {

    allEcupResults();

  }else{

    if(ecupUpdate.value){
      clearInterval(ecupUpdate.value);
      $showToast('Обновление еврокубка отключено', 'info', 2000);
    }

  }
})


function champChanged(chmp){
  champ.value = {...chmp}
}


function ecupChanged(chmp){
  ecup.value = {...chmp}
}


async function stands(){
  try {
     await $fetch('/api/admin/remote/stands');
    $showToast('Турнирные тоблицы были успешно обновлены', 'success', 2000);
  }catch (e) {
    $showToast('Ошибка', 'error', 2000);
    console.log(e);
  }
}


async function scorers(){
  try {
     await $fetch('/api/admin/remote/scorers');
    $showToast('Бомбардиры были успешно обновлены', 'success', 2000);
  }catch (e) {
    $showToast('Ошибка', 'error', 2000);
    console.log(e);
  }
}


async function results(){

  if(!champ.value || !champ.value.slug || !champ.value.api_id){
    $showToast('Выберите чемпионат', 'error', 2000);
    return;
  }

  try {
    await $fetch('/api/admin/remote/results', {
      method: 'PUT',
      body: champ.value,
    });

    $showToast('Результаты были успешно обновлены', 'success', 2000);

  }catch (e) {
    $showToast('Ошибка', 'error', 2000);
    console.log(e);
  }
}


async function allChampsTourResults(){

  tUpdate.value = setInterval(() => {

    Promise.all(data.value.champs.map(async (champ)=>{
      try {
        const {results} = await $fetch('/api/admin/remote/tourResults', {
          method: 'PUT',
          body: {...champ},
        });

        $socket.emit("tour-updated", results);

      }catch (e) {
        clearInterval(tUpdate.value);
        $showToast('Ошибка', 'error', 2000);
      }
    }))

    $showToast('Результаты тура были успешно обновлены', 'success', 2000);

  }, 2000*30*10);
}


async function tourResults(){

  if(!champ.value || !champ.value.slug || !champ.value.api_id || !champ.value.current_tour){
    $showToast('Выберите чемпионат', 'error', 2000);
    return;
  }

  try {
   const {results} = await $fetch('/api/admin/remote/tourResults', {
      method: 'PUT',
      body: {...champ.value},
    });

    $showToast('Результаты тура были успешно обновлены', 'success', 2000);

    $socket.emit("tour-updated", results);

  }catch (e) {
    $showToast('Ошибка', 'error', 2000);
    console.log(e);
  }
}


async function ecupStands (){
  if(!ecup.value || !ecup.value.slug || !ecup.value.api_id){
    $showToast('Выберите еврокубок', 'error', 2000);
    return;
  }

  try {
    await $fetch('/api/admin/remote/ecupStands', {
      method: 'PUT',
      body: ecup.value,
    });

    $showToast('Турнирные таблицы были успешно обновлены', 'success', 2000);

  }catch (e) {
    $showToast('Ошибка', 'error', 2000);
    console.log(e);
  }
}


async function ecupResults (){
  if(!ecup.value || !ecup.value.slug || !ecup.value.api_id){
    $showToast('Выберите еврокубок', 'error', 2000);
    return;
  }

  try {
    const results = await $fetch('/api/admin/remote/ecupResults', {
      method: 'PUT',
      body: ecup.value,
    });

    $socket.emit("ecup-updated", results);

    $showToast('Результаты были успешно обновлены', 'success', 2000);


  }catch (e) {
    $showToast('Ошибка', 'error', 2000);
    console.log(e);
  }
}


async function allEcupResults (){
  if(!ecup.value || !ecup.value.slug || !ecup.value.api_id){
    $showToast('Выберите еврокубок', 'error', 2000);
    intervalEcupUpdate.value = false;
    document.getElementById("ecupUpdate").checked = false;
    return;
  }

  $showToast('Обновление еврокубка включено', 'info', 2000);

  ecupUpdate.value = setInterval(() => {
    void (async () => {

      try {
        await $fetch('/api/admin/remote/ecupResults', {
          method: 'PUT',
          body: ecup.value,
        });

        $showToast('Результаты еврокубка были успешно обновлены', 'success', 2000);

      }catch (e) {
        $showToast('Ошибка', 'error', 2000);
        console.log(e);
      }


    })();
  }, 2000*30*10);
}

onBeforeUnmount(()=>{
  if(tUpdate.value){
    clearInterval(tUpdate.value);
  }
  if(ecupUpdate.value){
    clearInterval(ecupUpdate.value);
  }
})

</script>

<style scoped lang="scss">

.check {
  width: 30px;
  height: 30px;
}
</style>

