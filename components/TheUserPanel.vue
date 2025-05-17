<template>
  <div :class="panelClass">
    <ClientOnly>
      <template v-if="user">
        <div>
          {{user?.user_metadata?.login}}
        </div>
        <div v-if="showSpinner">
          <Icon name="svg-spinners:12-dots-scale-rotate" size="40"/>
        </div>
        <div class="w-[50px] h-[50px] overflow-hidden">
          <input @change="handleFileChange" ref="chosenFile" accept="image/png, image/jpeg"  hidden type="file">
          <img @click="chooseFiles" class="cursor-pointer rounded-full" width="80" height="80"
               :src="picToLoad || user?.user_metadata?.avatar || '/no_avatar.png'" alt="avatar">
        </div>
        <div @click="changeAvatar" class="cursor-pointer" v-if="selectedFile">
          <Icon name="material-symbols:upload-file" class size="30px"/>
        </div>
        <div @click="userLogout" class="cursor-pointer uppercase flex items-center gap-1">
          <Icon name="ic:twotone-log-out" size="20px"/>
          <span>Выход</span>
        </div>
      </template>
      <template v-else>
        <div class="cursor-pointer" @click="openModal">
          Вход
        </div>
      </template>
      <Teleport to="body">
        <TheModal :show="showDlg" :max-w="'400'" @close="closeModal" :showLoading="showLoading">
          <template #body>
            <TheAuth @load="showLoad" />
          </template>
        </TheModal>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type {IError, IUser} from "~/types/interfaces";
const user = useSupabaseUser();
const { auth } = useSupabaseClient();
const showSpinner = ref<boolean>(false);
const picToLoad = ref<string>();
const chosenFile = ref<HTMLElement>();
const selectedFile = ref<File>();
const showDlg = ref<boolean>(false);
const showLoading = ref<boolean>(false);

const props = withDefaults(defineProps<{
  panelClass?: string
}>(), {
  panelClass: 'gap-3 font-semibold hidden lg:flex items-center',
})

function openModal(): void {
  showDlg.value = true;
}

function showLoad(notClose?: boolean): void{
  showLoading.value = !showLoading.value
  if(!showLoading.value && !notClose) closeModal()
}
function closeModal(): void {
  showDlg.value = false;
}

function chooseFiles(): void {
  chosenFile.value?.click();
}

function handleFileChange(event: Event): void {

  picToLoad.value = '';

  selectedFile.value = (event.target as HTMLInputElement).files![0];

  if(!selectedFile.value){return}

  const file = (event.target as HTMLInputElement).files![0];

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
const userLogout = async (): Promise<void> => {
  selectedFile.value = undefined;
  picToLoad.value = '';
  await auth.signOut();
};

async function changeAvatar(): Promise<void>{
  try {

    const {data} = await auth.getUser() as unknown as { data: {user: IUser}};

    if(!data.user){
     await userLogout();
      useNuxtApp().$toast.error('Вы не авторизованы');
      return;
    }

    if(data.user.banned_until){
      if(Date.parse(data.user.banned_until as string) - Date.now() > 0){
        await userLogout();
        useNuxtApp().$toast.error('Вы не авторизованы');
        return
      }
    }

    if(!selectedFile.value){
      useNuxtApp().$toast.error('Файл не выбран');
      return; }

    useNuxtApp().$toast.info('Обработка...');

    const formData = new FormData();

    formData.append('data', JSON.stringify({id: user.value?.id, toDel: user.value?.user_metadata?.avatar}))

    formData.append('media_file', selectedFile.value as File)

    await $fetch<{ result: {avatar: string | null} }>('/api/auth/avatar', {
      method: 'POST',
      body: formData,
    })

    const { error } = await auth.refreshSession();

    selectedFile.value = undefined;

    picToLoad.value = '';

    if(error){throw error}

    useNuxtApp().$toast.success('Аватар успешно изменен');

  } catch (e) {

    const typedError = e as IError;

    if (typedError.response?._data?.message) {
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    } else {
      useNuxtApp().$toast.error(typedError.message)
    }

  }
}

</script>

<style lang="scss" scoped>

</style>