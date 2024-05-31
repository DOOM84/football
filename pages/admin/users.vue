<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7 text-zinc-800">
      Пользователи
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
          Добавить пользователя
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal class="text-zinc-800" :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>
              <div class="relative">
                <ClientOnly>
                  <TheLoading :show-load="showLoading" :full-page="false" />
                </ClientOnly>

                <div class="flex justify-center my-3">
                  <img :src="userToUpdate.avatar || '/no_avatar.png'" width="80" alt="">
                </div>

                <div class="my-3">
                  <label for="login">Логин</label>
                  <input type="text" v-model.trim="userToUpdate.login" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="login">
                </div>

                <div class="my-3">
                  <label for="email">Email</label>
                  <input type="text" v-model.trim="userToUpdate.email" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="email">
                </div>

                <div class="flex justify-center my-3" v-if="picToLoad">
                  <div v-if="showSpinner" class="text-center">
                    <Icon name="svg-spinners:12-dots-scale-rotate" size="40"/>
                  </div>
                  <img :src="picToLoad" width="200" alt="avatar">
                </div>

                <div class="my-3">
                  <label for="img" class="block">Аватар</label>
                  <input id="img" type="file" accept="image/jpeg"
                         @change="handleFileChange">
                </div>

                <div class="my-3">
                  <label for="password">Пароль</label>
                  <input type="text" v-model.trim="userToUpdate.password" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="password">
                </div>

                <div class="my-3">
                  <label for="passwordConfirmation">Пароль еще раз</label>
                  <input type="text" v-model.trim="userToUpdate.passwordConfirmation" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="passwordConfirmation">
                </div>

                <div class="my-3">
                  <label for="banUser">Заблокировать пользователя (300ms, 2h45m, 876600h..., (none - чтобы разблокировать)) </label>
                  <input type="text" v-model.trim="banTerm" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="banUser">
                  <button
                      type="button"
                      class="btn mt-1 font-bold"
                      @click.prevent="banUser">
                    Заблокировать
                  </button>
                </div>

                <div class="text-right">
                  <label for="status">Администратор</label>
                  <input type="checkbox" v-model="userToUpdate.admin" id="status">
                </div>

                <button
                    type="button"
                    class="btn mt-5 w-full font-bold bg-zinc-800 text-white"
                    @click.prevent="storeItem">
                  Сохранить
                </button>
              </div>
            </template>
          </TheModal>
        </Teleport>
        <AdminDtable @endFilter="toFilter = false"
                     :data="data.users"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['login', 'email']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Login</strong>
                <Icon @click.prevent="filter('login', 'asc')" name="ant-design:caret-up-filled" class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('login', 'desc')" name="ant-design:caret-down-filled" class="cursor-pointer"
                      size="10"/>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Аватар</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Email</strong>
                <Icon @click.prevent="filter('email', 'asc')" name="ant-design:caret-up-filled" class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('email', 'desc')" name="ant-design:caret-down-filled" class="cursor-pointer"
                      size="10"/>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Администратор</strong>
              </div>
            </table-head>
            <table-head/>
          </template>

          <template #rows="{row}">
            <table-body class="text-center">
              {{ row.login }}
            </table-body>
            <table-body class="text-center">
              <div class="flex justify-center">
                <img :src="row.avatar || '/no_avatar.png'" width="80" alt="">
              </div>
            </table-body>
            <table-body class="text-center">
              {{ row.email }}
            </table-body>
            <table-body class="text-center">
              {{ row.admin ? 'Да': 'Нет' }}
            </table-body>
            <table-body class="text-center">
              <div class="flex justify-center items-center gap-1">
                <button @click.prevent="updateItem(row)" class="p-1 border-none btn m-0">
                  <Icon name="material-symbols:edit-square-outline" size="20"/>
                </button>
                <button @click.prevent="removeItem(row.id, row.avatar)" class="p-1 border-none btn m-0">
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
import type {IError, IUser} from "~/types/interfaces";

definePageMeta({
  layout: 'admin',
  middleware: ["admin"]
})

const showSpinner = ref<boolean>(false);

const picToLoad = ref<string>();

const selectedFile = ref<File>();

useSeoMeta({
  title: () => 'Пользователи',
})

const {data, pending} = await useLazyFetch<{ users: IUser[] }>('/api/admin/users')

import useFilter from "~/helpers/useFilter";

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const showLoading = ref<boolean>(false);

const banTerm = ref<string>('');

const initUserData: Partial<IUser> = {
  admin: false,
  email: '',
  login: '',
  avatar: null,
}

const userToUpdate = ref<typeof initUserData>({});

function closeModal(): void {
  showDlg.value = false;
  mode.value = null;
  userToUpdate.value = {...initUserData};
  selectedFile.value = undefined;
}

function updateItem(user: IUser): void {
  mode.value = 'edit';
  userToUpdate.value = {...user}
  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  userToUpdate.value = {...initUserData};
  showDlg.value = true;
}

function handleFileChange(event: Event): void {

  picToLoad.value = '';

  selectedFile.value = (event.target as HTMLInputElement).files![0]

  const file = (event.target as HTMLInputElement).files![0]

  selectedFile.value = file

  const reader = new FileReader()

  reader.onloadstart = (event) => {
    showSpinner.value = true;
  }

  reader.onload = (event) => {
    showSpinner.value = false;
    picToLoad.value = event.target?.result as string
  }

  reader.readAsDataURL(file as File)
}

async function storeItem(): Promise<void> {

  try {
    showLoading.value = true;
    useNuxtApp().$toast.info('Processing...');

    const formData = new FormData();
    formData.append('data', JSON.stringify(userToUpdate.value))

    if (selectedFile.value) {
      formData.append('media_file', selectedFile.value as File)
    }

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: IUser }>('/api/admin/users/edit', {
        method: 'PUT',
        body: formData,
      })
      if (data.value?.users) {
        const ind: number = data.value.users.findIndex((item: IUser) => item.id === result.id);
        data.value.users[ind] = result;
      }
    }

    if (mode.value === 'add') {
      const {result} = await $fetch<{ result: IUser }>('/api/admin/users/add', {
        method: 'POST',
        body: formData,
      })
      data.value?.users.unshift(result);
    }

    filter('', '');

    closeModal();

    useNuxtApp().$toast.success('Успешно!');

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

async function removeItem(dbId: string, path: string): Promise<void> {
  if (confirm('Are you sure?')) {
    try {

      useNuxtApp().$toast.info('Обработка...');

      const {id} = await $fetch<{ id: string }>('/api/admin/users/remove', {
        method: 'DELETE',
        body: {id: dbId, path},
      })

      data.value?.users.splice(data.value.users.findIndex((item: IUser) => item.id === id), 1);

      filter('', '');

      useNuxtApp().$toast.success('Успешно!');

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
    }
  }
}

async function banUser(): Promise<void> {

  showLoading.value = true;

  if(!banTerm.value){useNuxtApp().$toast.error('Введите срок блокирования')}

  try {
    const {result} = await $fetch<{ result: boolean }>('/api/admin/users/ban', {
      method: 'PUT',
      body: {id: userToUpdate.value.id, term: banTerm.value},
    })

    if(result){useNuxtApp().$toast.success('Пользователь успешно заблокирован!')}

  }catch (e) {

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

