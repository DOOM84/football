<template>
  <div class="upload-avatar">
    <input ref="file" type="file" class="ava-upload" @change="onFileChange"/>
    <button class="btn-dark ava-upload__button" @click="onUploadFile"
            :disabled="!selectedFile">
      Загрузить
    </button>
  </div>
</template>

<script setup>
import getCookie from "@/helpers/getCookie";

const {$showToast, $logOut} = useNuxtApp();

const selectedFile = ref(null);

const file = ref(null);

const user = useUserInfo();

function onFileChange(e) {
  selectedFile.value = file.value.files[0];
}

async function onUploadFile() {

  if (!selectedFile.value) {
    $showToast('Выберите файл', 'error', 2500);
    return
  }
  if (!getCookie(document.cookie, 'token')) {
    $logOut();
    return
  }
  const formData = new FormData();

  formData.append("avatar", selectedFile.value);

  $showToast('Загрузка', 'info', 2500);
  try {
    const data = await $fetch('/api/auth/avatar', {
      method: 'POST',
      body: formData,
    })
    file.value.value = '';
    selectedFile.value = null;
    user.value.avatar = data.path;

  } catch (e) {

    if (e.response.status === 422) {
      $showToast('Неверный тип или размер файла превышен', 'error');
    } else {
      $showToast('Ошибка! Вы не авторизованы', 'error');
    }
  }
}

</script>


<style lang="scss" scoped>
.upload-avatar {
  text-align: center;
}

.ava-upload {
  width: 180px;
}

.btn-dark {
  border: none;
}

.ava-upload__button {

  padding: 0.1rem 0.5rem;
  background: #14942b;

  &:disabled {
    background: #b3bcc4;
    color: black;
    cursor: no-drop;
  }
}


</style>