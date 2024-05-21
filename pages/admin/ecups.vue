<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7">
      Еврокубки
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
          Добавить еврокубок
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>

              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="ecupToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label for="api_id">Api id</label>
                <input type="text" v-model.trim="ecupToUpdate.api_id" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="api_id">
              </div>

              <div class="my-3">
                <label>Стадия турнира</label>
                <Multiselect
                    v-model="ecupToUpdate.stage"
                    :options="stages"
                    :searchable="true"
                    valueProp="slug"
                    label="name"
                    placeholder="Выберите стадию турнира"></Multiselect>
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="ecupToUpdate.status" id="status">
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
                     :data="data.ecups"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.ecups && data.ecups.length">
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
                <template v-if="data.ecups && data.ecups.length">
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
            <table-body>
              {{ row.name }}
            </table-body>

            <table-body>
              {{ row.api_id }}
            </table-body>

            <table-body>
              {{ row.stage }}
            </table-body>

            <table-body>
              {{ row.status ? 'Да' : 'Нет' }}
            </table-body>
            <table-body>
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
import type {IChampDB, IEcupDB, IError} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";
import Multiselect from '@vueform/multiselect';

definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

const {data, pending} = useLazyFetch<{ecups: Partial<IEcupDB>[]}>('/api/admin/ecups')


const stages = [{name: 'Групповой турнир', slug: 'group'},{name: 'Плей-офф', slug: 'playoff'}];

useHead({
  titleTemplate: '%s - Еврокубки'
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const initEcupData: Partial<IEcupDB> = {status: false, name: ''};

const ecupToUpdate = ref<typeof initEcupData>({});

const showLoading = ref<boolean>(false);

function closeModal(): void {
  ecupToUpdate.value = {...initEcupData};
  showDlg.value = false;
  mode.value = null;
}

async function updateItem(ecup: IEcupDB) {
  mode.value = 'edit';

  ecupToUpdate.value = JSON.parse(JSON.stringify(ecup));

  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  ecupToUpdate.value = {...initEcupData}
  showDlg.value = true;
}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    const ecupToDb = {
      ...ecupToUpdate.value,
      api_id: +ecupToUpdate.value?.api_id!,
      slug: ecupToUpdate.value.slug || slugify(ecupToUpdate.value?.name as string || '', {strict: true, lower:true}),
    }

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: IEcupDB }>('/api/admin/ecups/edit', {
        method: 'PUT',
        body: ecupToDb,
      })
      const ind: number = data.value?.ecups.findIndex((ecup: Partial<IEcupDB>) => ecup.id === ecupToUpdate.value.id) as number;

      if(data.value){
        data.value.ecups[ind] = {...ecupToUpdate.value};
      }
    } else if (mode.value === 'add') {
      const {result} = await $fetch<{ result: Partial<IEcupDB> }>('/api/admin/ecups/add', {
        method: 'POST',
        body: ecupToDb,
      })
      if(data.value){
        data.value.ecups.unshift({...ecupToUpdate.value, id: result.id});
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

      const {id} = await $fetch<{ id: number }>('/api/admin/ecups/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })

      if(data.value){
        data.value.ecups.splice(data.value.ecups.findIndex((item) => item.id === +id), 1);
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

</script>

<style>

</style>