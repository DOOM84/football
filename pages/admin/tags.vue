<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7">
      Теги
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
          Добавить тег
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal class="text-zinc-800" :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>
              <div class="my-3 ">
                <label for="title">Название</label>
                <input type="text" v-model.trim="tagToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>
              <button
                  type="button"
                  class="btn mt-5 w-full font-bold bg-zinc-800 text-white"
                  @click.prevent="storeItem">
                Сохранить
              </button>
            </template>
          </TheModal>
        </Teleport>
        <AdminDtable v-if="showTable" @endFilter="toFilter = false"
                     :data="data.tags"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.tags && data.tags.length">
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
            </table-head>
          </template>

          <template #rows="{row}">
            <table-body class="text-center">
              {{ row.name }}
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
import type {IError, ITag} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";

definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

useSeoMeta({
  title: () => 'Теги',
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const initTagData: Partial<ITag> = {
  name: '',
}

const tagToUpdate = ref<typeof initTagData>({});

const showLoading = ref<boolean>(false);

const showTable = ref<boolean>(true);

const {data, pending} = await useLazyFetch<{tags: ITag[]}>('/api/admin/tags');

function closeModal(): void {
  tagToUpdate.value = {...initTagData};
  showDlg.value = false;
  mode.value = null;
}

function updateItem(tag: ITag): void {
  mode.value = 'edit';

  tagToUpdate.value = JSON.parse(JSON.stringify(tag));
  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  tagToUpdate.value = {...initTagData};

  showDlg.value = true;
}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    useNuxtApp().$toast.info('Обработка...');

    tagToUpdate.value.slug = !tagToUpdate.value.slug ?
        slugify(tagToUpdate.value?.name as string || '', {strict: true, lower: true}) : tagToUpdate.value.slug;

    // showTable.value = false;

    if (mode.value === 'edit') {

      const {result} = await $fetch<{
        result: { id: number; image: string; images: Record<string, string[]>; videos: string[] }
      }>('/api/admin/tags/edit', {
        method: 'PUT',
        body: tagToUpdate.value,
      })
      const ind: number = data.value?.tags.findIndex((tag) => tag.id === tagToUpdate.value.id) as number;


      if (data.value) {
        data.value.tags[ind] = {...tagToUpdate.value} as ITag;
      }
    } else if (mode.value === 'add') {

      const {result} = await $fetch<{
        result: { id: number;}
      }>('/api/admin/tags/add', {
        method: 'POST',
        body: tagToUpdate.value,
      })
      if (data.value) {
        data.value.tags.unshift({...tagToUpdate.value, id: result.id} as ITag);

      }
    }

    filter('', '');

    closeModal();

    useNuxtApp().$toast.success('Информация успешно изменена');

  } catch (e) {
    const typedError = e as IError;

    if (typedError.status === 403) {
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Not found'
      })
    }

    if (typedError.response?._data?.message) {
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    }

  } finally {
    showLoading.value = false;
    //  showTable.value = true;
  }
}

async function removeItem(dbId: number): Promise<void> {

  if (confirm('Are you sure?')) {
    try {
      showLoading.value = true;

      useNuxtApp().$toast.info('Обработка...');

      const {id} = await $fetch<{ id: number }>('/api/admin/tags/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })

      //showTable.value = false;

      filter('', '');

      data.value!.tags.splice(data.value!.tags.findIndex((item) => item.id === +id), 1);

      useNuxtApp().$toast.success('Информация успешно изменена');

    } catch (e) {

      const typedError = e as IError;

      if (typedError.status === 403) {
        throw createError({
          fatal: true,
          statusCode: 404,
          message: 'Не найдено'
        })
      }

      if (typedError.response?._data?.message) {
        useNuxtApp().$toast.error(typedError.response?._data?.message as string);
      }

    } finally {
      showLoading.value = false;
      // showTable.value = true;
    }
  }
}

</script>

