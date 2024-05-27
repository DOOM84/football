<template>
  <main class="withFooter text-center">
    <ClientOnly>
      <TheLoading :show-load="showLoading"/>
    </ClientOnly>
    <p class="text-left text-3xl my-3 text-zinc-800">
      Обновление через api
    </p>
    <h1 class="text-2xl font-bold my-3 text-zinc-800">
      Чемпионаты
    </h1>

    <div v-if="pending || !data">
      <TheLoading loader="dots"/>
    </div>
    <template v-else>
      <div class="flex flex-wrap gap-3 justify-center items-center">
        <div>
          <button
              class="btn font-bold"
              type="button"

              @click.prevent="stands">
            Турнирные таблицы всех чемпионатов
          </button>
        </div>

        <div>
          <button
              class="btn font-bold"
              type="button"

              @click.prevent="results">
            Все результаты чемпионата
          </button>
        </div>


        <div class="flex items-center gap-2">
          <button
              class="btn font-bold"
              type="button"

              @click.prevent="tourResults">
            Результаты тура чемпионата
          </button>
          <div class="flex flex-col items-center">
            <label for="allChampsTour">Удалить пред. тур</label>
            <input type="checkbox" class="check ml-2" v-model="prevTourDelete" id="allChampsTour">
          </div>
        </div>

        <div>
          <button
              class="btn font-bold"
              type="button"

              @click.prevent="scorers">
            Бомбардиры всех чемпионатов
          </button>
        </div>

      </div>

      <div class="flex my-10 justify-center items-center g-1">
        <label for="allChampsLive">Обновлять результаты всех чемпионатов каждые 3 мин.</label>
        <input type="checkbox" class="check ml-2" v-model="intervalUpdate" id="allChampsLive">
      </div>

      <div class="mt-2">
        <label>Чемпионат</label>
        <ClientOnly>
          <Multiselect
              v-model="champ"
              :options="data.champs"
              :searchable="true"
              valueProp="slug"
              label="name"
              :object="true"
              @change="champChanged"
              placeholder="Выберите чемпионат"></Multiselect>
        </ClientOnly>
      </div>

      <h1 class="text-2xl font-bold mt-10 text-zinc-800">
        Еврокубки
      </h1>


      <div class="flex mb-2 justify-center items-center g-1">
        <label for="ecupUpdate">Обновлять результаты еврокубка каждые 3 мин.</label>
        <input type="checkbox" class="check ml-2" v-model="intervalEcupUpdate" id="ecupUpdate">
      </div>


      <div class="flex flex-wrap g-1 justify-end gap-3">
        <button
            class="btn font-bold"
            type="button"

            @click.prevent="ecupStands">
          Турнирные таблицы еврокубка
        </button>
        <button
            class="btn font-bold"
            type="button"

            @click.prevent="ecupResults">
          Результаты еврокубка
        </button>

      </div>

      <div class="form-group mt-2">
        <label>Еврокубок</label>
        <ClientOnly>
          <Multiselect
              v-model="ecup"
              :options="data.ecups"
              :searchable="true"
              valueProp="slug"
              label="name"
              :object="true"
              @change="ecupChanged"
              placeholder="Выберите еврокубок"></Multiselect>
        </ClientOnly>
      </div>
    </template>


  </main>
</template>
<script lang="ts" setup>
import Multiselect from '@vueform/multiselect';
import type {IChamp, IEcup, IError} from "~/types/interfaces";
import { io, type Socket } from 'socket.io-client';


definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

useHead({
  titleTemplate: '%s - Обновление по API'
})

const socket = ref<Socket>();

const champ = ref<IChamp>();

const showLoading = ref<boolean>(false);

const ecup = ref<IEcup>();

const tUpdate = ref<ReturnType<typeof setInterval>>();

const ecupUpdate = ref<ReturnType<typeof setInterval>>();

const intervalUpdate = ref<boolean>(false);

const intervalEcupUpdate = ref<boolean>(false);

const prevTourDelete = ref<boolean>(false);

const {data, pending} = useLazyFetch<{
  ecups: IEcup[];
  champs: IChamp[];
}>('/api/admin/remote')


watch(intervalUpdate, () => {

  if (intervalUpdate.value) {

    useNuxtApp().$toast.info('Обновление включено');
    liveResults();
   // allChampsTourResults();

  }else{

    if(tUpdate.value){
      clearInterval(tUpdate.value);
      useNuxtApp().$toast.info('Обновление отключено');
    }
  }
})


watch(intervalEcupUpdate, () => {

  if (intervalEcupUpdate.value) {

    allEcupResults();

  }else{

    if(ecupUpdate.value){
      clearInterval(ecupUpdate.value);
      useNuxtApp().$toast.info('Обновление еврокубка отключено');
    }

  }
})


function champChanged(chmp: IChamp): void{
  champ.value = {...chmp}
}


function ecupChanged(ecp: IEcup): void{
  ecup.value = {...ecp}
}


async function stands(): Promise<void> {
  try {
    showLoading.value = true;
   await $fetch('/api/admin/remote/stands', {method: 'PUT'});

    useNuxtApp().$toast.success('Турнирные тоблицы были успешно обновлены');
  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}


async function scorers(): Promise<void> {
  try {
    showLoading.value = true;
    await $fetch('/api/admin/remote/scorers', {method: 'PUT'});

    useNuxtApp().$toast.success('Бомбардиры были успешно обновлены');

  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}


async function results(): Promise<void> {

  if(!champ.value || !champ.value.slug || !champ.value.api_id){
    useNuxtApp().$toast.error('Выберите чемпионат');
    return;
  }

  try {
    showLoading.value = true;
    await $fetch('/api/admin/remote/results', {
      method: 'PUT',
      body: champ.value,
    });
    useNuxtApp().$toast.success('Результаты были успешно обновлены');

  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}


async function allChampsTourResults(): Promise<void> {
  try {
    tUpdate.value = setInterval(async () => {

      for (let i = 0; i < data.value!.champs.length; i++) {
        const {results} = await $fetch('/api/admin/remote/tourResults', {
          method: 'PUT',
          body: data.value!.champs[i],
        });
        //useNuxtApp().$socket.emit("tour-updated", results);
        socket.value?.emit( 'tour-updated', results);
      }
      useNuxtApp().$toast.success('Результаты тура были успешно обновлены');
    }, 2000*30*10);
  }catch (e) {
   // clearInterval(tUpdate.value);
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }
}


async function tourResults(): Promise<void> {

  if(!champ.value || !champ.value.slug || !champ.value.api_id || !champ.value.current_tour){
    useNuxtApp().$toast.error('Выберите чемпионат');
    return;
  }

  try {
    showLoading.value = true;
  const {results} =  await $fetch('/api/admin/remote/tourResults', {
      method: 'PUT',
      body: {...champ.value, prevDel: prevTourDelete.value},
    });

    useNuxtApp().$toast.success('Результаты тура были успешно обновлены');

   // useNuxtApp().$socket.emit("tour-updated", results);

    socket.value?.emit( 'tour-updated', results);

  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}

const leagues = computed(()=> {

  let leagues = '';

  data.value!.champs.map(champ => {
    leagues = leagues.concat(champ.api_id!.toString()+'-')
    return champ.api_id
  });

  data.value!.ecups.map(ecup => {
    leagues = leagues.concat(ecup.api_id!.toString()+'-')
    return ecup.api_id
  });

  return leagues.slice(0, -1);
})
async function liveResults(): Promise<void> {

  try {

    showLoading.value = true;

    tUpdate.value = setInterval(async () => {

      const {results} =  await $fetch('/api/admin/remote/liveResults', {
        method: 'PUT',
        body: {leagues: leagues.value},
      });

      useNuxtApp().$toast.success('Результаты были успешно обновлены');

      socket.value?.emit( 'live-results');

    }, 2000*30*3);

  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}


async function ecupStands(): Promise<void> {
  if(!ecup.value || !ecup.value.slug || !ecup.value.api_id){
    useNuxtApp().$toast.error('Выберите еврокубок');
    return;
  }

  try {
    showLoading.value = true;
    await $fetch('/api/admin/remote/ecupStands', {
      method: 'PUT',
      body: ecup.value,
    });
    useNuxtApp().$toast.success('Турнирные таблицы были успешно обновлены');

  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}


async function ecupResults(): Promise<void> {

  if(!ecup.value || !ecup.value.slug || !ecup.value.api_id){
    useNuxtApp().$toast.error('Выберите еврокубок');
    return;
  }

  try {
    showLoading.value = true;
    const {results} = await $fetch<Record<string, any>>('/api/admin/remote/ecupResults', {
      method: 'PUT',
      body: ecup.value,
    });

    socket.value?.emit( 'ecup-updated', results);

    useNuxtApp().$toast.success('Результаты были успешно обновлены');


  }catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }finally {
    showLoading.value = false;
  }
}


async function allEcupResults(): Promise<void> {

  if(!ecup.value || !ecup.value.slug || !ecup.value.api_id){
    useNuxtApp().$toast.error('Выберите еврокубок');
    intervalEcupUpdate.value = false;
 //   document.getElementById("ecupUpdate").checked = false;
    const element = <HTMLInputElement> document.getElementById("ecupUpdate");
    element.checked = false;
    return;
  }
  useNuxtApp().$toast.info('Обновление еврокубка включено');

  try {
    ecupUpdate.value = setInterval(() => {
      void (async () => {
        const {results} =  await $fetch<Record<string, any>>('/api/admin/remote/ecupResults', {
          method: 'PUT',
          body: ecup.value,
        });

        //useNuxtApp().$socket.emit("ecup-updated", results);
        socket.value?.emit( 'ecup-updated', results);
        useNuxtApp().$toast.success('Результаты еврокубка были успешно обновлены');
      })();
    }, 2000*30*3);
  }catch (e) {
   // clearInterval(ecupUpdate.value);
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }
    useNuxtApp().$toast.error('Ошибка');
  }
}

onMounted(() => {
  socket.value = io({
    path: '/api/socket.io'
  })

});

onBeforeUnmount(() => {
  if(tUpdate.value){
    clearInterval(tUpdate.value);
  }
  if(ecupUpdate.value){
    clearInterval(ecupUpdate.value);
  }
  socket.value?.disconnect();
})

</script>

<style scoped lang="scss">

.check {
  width: 30px;
  height: 30px;
}
</style>

