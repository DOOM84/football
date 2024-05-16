<template>
  <main class="text-center pb-2 adminHome">
    <ClientOnly>
      <TheLoading :show-load="showLoading"/>
    </ClientOnly>
    <h1 class="mt-2 text-center">Панель управления</h1>
    <h3 class="text-center">Добро пожаловать в систему управления сайтом. Выберите необходимое действие из меню слева.</h3>
    <div class="flex justify-end flex-wrap my-10 gap-5">
      <button
          class="btn font-bold"
          type="button"
          @click.prevent="addPlayersIndex">
        Обновить индексы игроков
      </button>
      <button
          class="btn font-bold"
          type="button"
          @click.prevent="addPostsIndex">
        Обновить индексы новостей
      </button>
    </div>
  </main>
</template>

<script lang="ts" setup>

import type {IError} from "~/types/interfaces";

definePageMeta({
  layout: 'admin',
  middleware: ["auth"]
})

const showLoading = ref<boolean>(false);

async function addPlayersIndex(): Promise<void> {
  try {
    useNuxtApp().$toast.info('Обработка...');
    showLoading.value = true;
    const {res} = await $fetch('/api/admin/search/refreshPlayers', {
      method: 'POST',
    })

    useNuxtApp().$toast.success('Сохранено успешно!');

  } catch (e) {

    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }

    if(typedError.response?._data?.message){
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    }
  }finally {
    showLoading.value = false;
  }


}

async function addPostsIndex(): Promise<void> {
  try {
    useNuxtApp().$toast.info('Обработка...');
    showLoading.value = true;
    const {res} = await $fetch('/api/admin/search/refreshPosts', {
      method: 'POST',
    })

    useNuxtApp().$toast.success('Сохранено успешно!');

  } catch (e) {
    const typedError = e as IError;

    if(typedError.status === 403){
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }

    if(typedError.response?._data?.message){
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    }
  }finally {
    showLoading.value = false;
  }


}

</script>

<style lang="scss" scoped>
.adminHome {
  border-bottom: 1px solid #dee2e6
}
</style>