<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7 text-zinc-800">
      Кубки
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
          Добавить кубок
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>

              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="cupToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label>Чемпионат</label>
                <Multiselect
                    v-model="cupToUpdate.champ!.slug"
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
                <input type="text" v-model.trim="cupToUpdate.api_id" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="api_id">
              </div>

              <div class="my-3">
                <label for="stage">Стадия турнира (опционально)</label>
                <input type="text" v-model.trim="cupToUpdate.stage" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="stage">
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="cupToUpdate.status" id="status">
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
                     :data="data.cups"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.cups && data.cups.length">
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
                <template v-if="data.cups && data.cups.length">
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
import type {IChamp, ICup, IError} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";
import Multiselect from '@vueform/multiselect';

definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

const {data, pending} = useLazyFetch<{cups: Partial<ICup>[]; champs: Partial<IChamp>[]}>('/api/admin/cups')


//const stages = [{name: 'Групповой турнир', slug: 'group'},{name: 'Плей-офф', slug: 'playoff'}];

useHead({
  titleTemplate: '%s - Кубки'
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const initCupData: Partial<ICup> = {status: false, name: '', champ: {slug: '', name: ''}};

const cupToUpdate = ref<typeof initCupData>({});

const showLoading = ref<boolean>(false);

function closeModal(): void {
  cupToUpdate.value = {...initCupData};
  showDlg.value = false;
  mode.value = null;
}

async function updateItem(cup: ICup) {
  mode.value = 'edit';

  cupToUpdate.value = JSON.parse(JSON.stringify(cup));

  if (!cupToUpdate.value.champ) {
    (cupToUpdate.value.champ as unknown as Partial<IChamp>) = {slug: '', name: ''};
  }

  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  cupToUpdate.value = {...initCupData}
  showDlg.value = true;
}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    cupToUpdate.value.slug = !cupToUpdate.value.slug ?
        slugify(cupToUpdate.value?.name as string || '',
            {strict: true, lower: true}) : cupToUpdate.value.slug;

    /*const cupToDb = {
      ...cupToUpdate.value,
      api_id: +cupToUpdate.value?.api_id!,
      slug: cupToUpdate.value.slug || slugify(cupToUpdate.value?.name as string || '', {strict: true, lower:true}),
    }*/

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: ICup }>('/api/admin/cups/edit', {
        method: 'PUT',
        body: {...cupToUpdate.value, api_id: +cupToUpdate.value.api_id!},
      })
      const ind: number = data.value?.cups.findIndex((cup: Partial<ICup>) => cup.id === cupToUpdate.value.id) as number;

      if(data.value){
        data.value.cups[ind] = {...cupToUpdate.value};
      }
    } else if (mode.value === 'add') {
      const {result} = await $fetch<{ result: Partial<ICup> }>('/api/admin/cups/add', {
        method: 'POST',
        body: {...cupToUpdate.value, api_id: +cupToUpdate.value.api_id!},
      })
      if(data.value){
        data.value.cups.unshift({...cupToUpdate.value, id: result.id});
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

      const {id} = await $fetch<{ id: number }>('/api/admin/cups/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })

      if(data.value){
        data.value.cups.splice(data.value.cups.findIndex((item) => item.id === +id), 1);
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
    (cupToUpdate.value.champ as unknown as Partial<IChamp>) = {slug: '', name: ''};
    cupToUpdate.value.champ_id = null;
    return
  }
  cupToUpdate.value.champ = {...data.value?.champs[data.value.champs.findIndex(ch => ch.slug === champ)]} as IChamp;
  cupToUpdate.value.champ_id = cupToUpdate.value.champ?.id;
}

</script>

<style>

</style>