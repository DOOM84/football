<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7 text-zinc-800">
      Вторые дивизионы
    </div>
    <div v-if="pending || !data">
      <TheLoading loader="dots"/>
    </div>
    <template v-else>
      <div class="text-right">
        <button
            class="btn font-bold"
            type="button"
            @click.prevent="addItem">
          Добавить дивизион
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>

              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="leagueToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label>Чемпионат</label>
                <Multiselect
                    v-model="leagueToUpdate.champ!.slug"
                    :options="data.champs"
                    :searchable="true"
                    valueProp="slug"
                    label="name"
                    @change="champChanged"
                    placeholder="Выберите чемпионат">
                </Multiselect>
              </div>

              <div class="my-3">
                <label for="api_id">Api id</label>
                <input type="text" v-model.trim="leagueToUpdate.api_id" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="api_id">
              </div>

              <div class="my-3">
                <label for="stage">Стадия турнира (опционально)</label>
                <input type="text" v-model.trim="leagueToUpdate.stage" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="stage">
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="leagueToUpdate.status" id="status">
              </div>
              <button
                  type="button"
                  class="btn mt-5 w-full font-bold"
                  @click.prevent="storeItem">
                Save
              </button>
            </template>
          </TheModal>
        </Teleport>
        <AdminDtable @endFilter="toFilter = false"
                     :data="data.leagues"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.leagues && data.leagues.length">
                <Icon @click.prevent="filter('name', 'asc')" name="ant-design:caret-up-filled"
                      class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('name', 'desc')" name="ant-design:caret-down-filled"
                      class="cursor-pointer"
                      size="10"/>
                </template>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Api id</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Стадия</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Опубликовано</strong>
                <template v-if="data.leagues && data.leagues.length">
                <Icon @click.prevent="filter('status', 'asc')" name="ant-design:caret-up-filled"
                      class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('status', 'desc')" name="ant-design:caret-down-filled"
                      class="cursor-pointer"
                      size="10"/>
                </template>
              </div>
            </table-head>
            <table-head/>
          </template>

          <template #rows="{row}">
            <table-body class="text-center">
              {{ row.name }}
            </table-body>

            <table-body class="text-center">
              {{ row.api_id }}
            </table-body>

            <table-body class="text-center">
              {{ row.stage }}
            </table-body>

            <table-body class="text-center">
              {{ row.status ? 'Да' : 'Нет' }}
            </table-body>
            <table-body class="text-center">
              <div class="flex justify-center items-center gap-1">
                <button @click.prevent="updateItem(row)" class="p-1 border-none btn m-0">
                  <Icon name="material-symbols:edit-square-outline" size="20"/>
                </button>
                <button @click.prevent="removeItem(row.id)" class="p-1 border-none btn m-0">
                  <Icon name="ion:trash-b" size="20"/>
                </button>
              </div>
            </table-body>
          </template>
        </AdminDtable>
      </ClientOnly>
    </template>


  </div>
</template>

<script lang="ts" setup>
import slugify from "slugify";
import type {IChamp, ILeague, IError} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";
import Multiselect from '@vueform/multiselect';

definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

const {data, pending} = useLazyFetch<{leagues: Partial<ILeague>[]; champs: Partial<IChamp>[]}>('/api/admin/leagues');

useHead({
  titleTemplate: '%s - Кубки'
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const initLeagueData: Partial<ILeague> = {status: false, name: '', champ: {slug: '', name: ''}};

const leagueToUpdate = ref<typeof initLeagueData>({});

const showLoading = ref<boolean>(false);

function closeModal(): void {
  leagueToUpdate.value = {...initLeagueData};
  showDlg.value = false;
  mode.value = null;
}

async function updateItem(league: ILeague) {
  mode.value = 'edit';

  leagueToUpdate.value = JSON.parse(JSON.stringify(league));

  if (!leagueToUpdate.value.champ) {
    (leagueToUpdate.value.champ as unknown as Partial<IChamp>) = {slug: '', name: ''};
  }

  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  leagueToUpdate.value = {...initLeagueData}
  showDlg.value = true;
}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    leagueToUpdate.value.slug = !leagueToUpdate.value.slug ?
        slugify(leagueToUpdate.value?.name as string || '',
            {strict: true, lower: true}) : leagueToUpdate.value.slug;

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: ILeague }>('/api/admin/leagues/edit', {
        method: 'PUT',
        body: {...leagueToUpdate.value, api_id: +leagueToUpdate.value.api_id!},
      })
      const ind: number = data.value?.leagues.findIndex((league: Partial<ILeague>) => league.id === leagueToUpdate.value.id) as number;

      if(data.value){
        data.value.leagues[ind] = {...leagueToUpdate.value};
      }
    } else if (mode.value === 'add') {
      const {result} = await $fetch<{ result: Partial<ILeague> }>('/api/admin/leagues/add', {
        method: 'POST',
        body: {...leagueToUpdate.value, api_id: +leagueToUpdate.value.api_id!},
      })
      if(data.value){
        data.value.leagues.unshift({...leagueToUpdate.value, id: result.id});
      }
    }

    filter('', '');

    closeModal();

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

  } finally {
    showLoading.value = false;
  }
}

async function removeItem(dbId: number): Promise<void> {

  if (confirm('Are you sure?')) {
    try {
      showLoading.value = true;
      //useNuxtApp().$toast.info('Processing...');

      const {id} = await $fetch<{ id: number }>('/api/admin/leagues/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })

      if(data.value){
        data.value.leagues.splice(data.value.leagues.findIndex((item) => item.id === +id), 1);
      }

      filter('', '');

      useNuxtApp().$toast.success('Completed!');

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

    } finally {
      showLoading.value = false;
    }
  }
}

function champChanged(champ: any): void {
  if (!champ) {
    (leagueToUpdate.value.champ as unknown as Partial<IChamp>) = {slug: '', name: ''};
    leagueToUpdate.value.champ_id = null;
    return
  }
  leagueToUpdate.value.champ = {...data.value?.champs[data.value.champs.findIndex(ch => ch.slug === champ)]} as IChamp;
  leagueToUpdate.value.champ_id = leagueToUpdate.value.champ?.id;
}

</script>

<style>

</style>