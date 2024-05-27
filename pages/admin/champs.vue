<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7">
      Чемпионаты
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
          Добавить чемпионат
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>
              <div class="text-right">
                <button v-if="mode==='edit'"
                        class="btn font-bold"
                        type="button"
                        @click.prevent="addChampSquad">
                  Добавить состав
                </button>
              </div>
              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="champToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label for="api_id">Api id</label>
                <input type="text" v-model.trim="champToUpdate.api_id" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="api_id">
              </div>

              <div class="my-3">
                <label for="current_tour">Текущий тур</label>
                <input type="text" v-model.trim="champToUpdate.current_tour" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="current_tour">
              </div>

              <div class="my-3">
                <label for="all_tours">Всего туров</label>
                <input type="text" v-model.trim="champToUpdate.all_tours" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="all_tours">
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="champToUpdate.status" id="status">
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
        <AdminDtable  @endFilter="toFilter = false"
                     :data="data.champs"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.champs && data.champs.length">
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
                <strong>Текущий тур</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Всего туров</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Опубликовано</strong>
                <template v-if="data.champs && data.champs.length">
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
              {{ row.current_tour }}
            </table-body>

            <table-body>
              {{ row.all_tours }}
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
import type {IChamp, IPlayer, IError} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";

definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

const {data, pending} = useLazyFetch<{ champs: Partial<IChamp>[] }>('/api/admin/champs')


useHead({
  titleTemplate: '%s - Чемпионаты'
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const initChampData: Partial<IChamp> = {status: false, name: ''};

const champToUpdate = ref<typeof initChampData>({});

const showLoading = ref<boolean>(false);


function closeModal(): void {
  champToUpdate.value = {...initChampData};
  showDlg.value = false;
  mode.value = null;
}

async function addChampSquad(): Promise<void> {
  try {
    showLoading.value = true;

    const {players} = await $fetch<{ players: IPlayer[] }>('/api/admin/remote/squad',
        {params: {champApiId: champToUpdate.value.api_id}});

    useNuxtApp().$toast.success('Сохранено успешно!');

  } catch (e) {
    console.log(e);
  } finally {
    showLoading.value = false;
  }


}

function updateItem(champ: IChamp): void {
  mode.value = 'edit';

  champToUpdate.value = JSON.parse(JSON.stringify(champ));

  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  champToUpdate.value = {...initChampData}
  showDlg.value = true;
}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    const champToDb = {
      ...champToUpdate.value,
      api_id: +champToUpdate.value?.api_id!,
      current_tour: +champToUpdate.value?.current_tour!,
      all_tours: +champToUpdate.value?.all_tours!,
      slug: champToUpdate.value.slug || slugify(champToUpdate.value?.name as string || '', {strict: true, lower: true}),
    }

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: IChamp }>('/api/admin/champs/edit', {
        method: 'PUT',
        body: champToDb,
      })
      const ind: number = data.value?.champs.findIndex((champ: Partial<IChamp>) => champ.id === champToUpdate.value.id) as number;

      if (data.value) {
        data.value.champs[ind] = {...champToUpdate.value};
      }
    } else if (mode.value === 'add') {
      const {result} = await $fetch<{ result: Partial<IChamp> }>('/api/admin/champs/add', {
        method: 'POST',
        body: champToDb,
      })
      if (data.value) {
        data.value.champs.unshift({...champToUpdate.value, id: result.id});
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

      const {id} = await $fetch<{ id: number }>('/api/admin/champs/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })


      if (data.value) {
        data.value.champs.splice(data.value.champs.findIndex((item) => item.id === +id), 1);
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