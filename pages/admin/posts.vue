<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Новости
    </h1>

    <div class="right">
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="addItem">
        Добавить
      </button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">

      <div v-if="mode === 'edit'" class="flexCentered">
        <img class="pic-thumb" :src="postToUpdate.images.thumbnail" alt="">
      </div>


      <div class="form-group left">
        <label for="title">Название</label>
        <input type="text" v-model.trim="postToUpdate.title" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="subtitle">Описание</label>
        <input type="text" v-model.trim="postToUpdate.subtitle" class="form-control " id="subtitle">
      </div>

      <div class="form-group">
        <label for="file">Изображение</label>
        <input class="mr-1" ref="file" type="file" id="file" @change="onFileChange"/>
      </div>

      <label>Текст новости</label>
      <AdminTheEditor @updatedContent="updatedContent" :content="postToUpdate.body"></AdminTheEditor>

      <div class="form-group mt-2">
        <label>Чемпионат</label>
        <Multiselect
            v-model="postToUpdate.champ"
            :options="data.champs"
            :searchable="true"
            valueProp="id"
            label="name"
            @change="champChanged"
            placeholder="Выберите чемпионат"></Multiselect>
      </div>

      <div class="form-group ">
        <label>Еврокубок</label>
        <Multiselect
            v-model="postToUpdate.ecup"
            :options="data.ecups"
            :searchable="true"
            valueProp="id"
            label="name"
            @change="ecupChanged"
            placeholder="Выберите еврокубок"></Multiselect>
      </div>

      <div class="form-group">
        <label>Команды</label>
        <Multiselect
            id="teams"
            v-model="postToUpdate.teams"
            :object="false"
            mode="tags"
            valueProp="slug"
            :searchable="true"
            :createTag="false"
            :options="data.teams"
            label="name"
            @change="teamChanged"
        />
      </div>

      <div class="form-group ">
        <label>Игроки</label>
        <Multiselect
            id="players"
            v-model="postToUpdate.players"
            :object="false"
            mode="tags"
            valueProp="slug"
            :searchable="true"
            :createTag="false"
            :options="data.players"
            label="name"
        />
      </div>

      <div class="form-group">
        <label>Теги</label>
        <Multiselect
            id="tags"
            v-model="postToUpdate.tags"
            :object="false"
            mode="tags"
            valueProp="slug"
            :searchable="true"
            :create-option="true"
            :options="data.tags"
            label="name"
        />
      </div>
      <div class="form-group left">
        <label for="source">Источник</label>
        <input type="text" v-model.trim="postToUpdate.source" class="form-control " id="source">
      </div>

      <div class="right mt-2 mr-2 admin-opts">
        <div>
          <label for="is_headline" class="admin-status">В карусели на главной</label>
          <input type="checkbox" v-model="postToUpdate.is_headline" id="is_headline">
        </div>
        <div>
          <label for="status" class="admin-status">Опубликовано</label>
          <input type="checkbox" v-model="postToUpdate.status" id="status">
        </div>
      </div>

      <button
          type="button"
          class="button btn-dark w100 mt-1"
          @click.prevent="storeItem">
        Сохранить
      </button>
    </AdminModalWrap>

    <ClientOnly>
      <AdminDtable @endFilter="toFilter = false"
                   :data="data.posts"
                   :toFilter="toFilter"
                   :filtering="filtering"
                   :toSearch="['title']">
        <template #thead>
          <table-head>
            <div class="flexCentered">
              <strong>Название</strong>
              <i @click.self="filter('title', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
              <i @click.self="filter('title', 'desc')" class="fa fa-caret-down pointer"></i>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>Изображение</strong>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>Опубликовано</strong>
              <i @click.self="filter('status', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
              <i @click.self="filter('status', 'desc')" class="fa fa-caret-down pointer"></i>
            </div>
          </table-head>
          <table-head/>
        </template>

        <template #rows="{row}">
          <table-body>
            {{ row.title }}
          </table-body>
          <table-body>
            <img height="210" :src="row.images.thumbnail" alt="">
          </table-body>
          <table-body>
            {{ row.status ? 'Да' : 'Нет' }}
          </table-body>
          <table-body>
            <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
            <button @click.prevent="removeItem(row.id)" class="button block btn-dark"><i class="fas fa-trash"></i>
            </button>
          </table-body>
        </template>
      </AdminDtable>
    </ClientOnly>
  </main>
</template>
<script setup>
import {ref} from 'vue';
import Multiselect from '@vueform/multiselect';
import {useRouter} from 'vue-router';

const {$showToast, $logOut, $socket} = useNuxtApp();

const router = useRouter();
const file = ref(null);
const selectedFile = ref(null);

definePageMeta({
  layout: 'admin'
})


const {data, error} = await useAsyncData('adminPosts', () => $fetch('/api/admin/posts'));


const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const postToUpdate = ref({status: true, tags: [], teams: [], players: []});
const showDlg = ref(false);
const mode = ref(null);

function onFileChange(e) {
  selectedFile.value = file.value.files[0];
}


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  postToUpdate.value = {status: false, tags: [], teams: [], players: []};
  selectedFile.value = null;
}

function updatedContent(cont) {
  postToUpdate.value.body = cont;
}

async function updateItem(post) {
  mode.value = 'edit';
  postToUpdate.value = {...post}

  if (postToUpdate.value.teams && postToUpdate.value.teams.length) {
    await teamChanged(postToUpdate.value.teams)
  }

  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  postToUpdate.value = {status: true, tags: [], teams: [], players: []};
}

async function teamChanged(teams) {
  data.value.players = await $fetch('/api/admin/posts/load_players',
      {params: {teams: JSON.stringify(teams)}});
}

function champChanged(champ) {

  if (!champ) {
    postToUpdate.value.champ_name = null;
    postToUpdate.value.champ = null;
    return
  }

  postToUpdate.value.champ_name = data.value.champs[data.value.champs.findIndex(ch => ch.slug === champ)].name;
}

function ecupChanged(ecup) {

  if (!ecup) {
    postToUpdate.value.ecup_name = null;
    postToUpdate.value.ecup = null;
    return
  }

  postToUpdate.value.ecup_name = data.value.ecups[data.value.ecups.findIndex(ec => ec.slug === ecup)].name;
}


async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(postToUpdate.value))

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }

  try {
    $showToast('Обработка...', 'info', 2000);
    if (mode.value === 'edit') {
      const {result, allTags} = await $fetch('/api/admin/posts/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.posts.findIndex(item => item.id === result.id);
      data.value.tags.push(...allTags);
      data.value.posts[ind] = result;
    }

    if (mode.value === 'add') {
      const {result, allTags} = await $fetch('/api/admin/posts/add', {
        method: 'POST',
        body: formData,
      })
      data.value.tags.push(...allTags);
      data.value.posts.unshift(result);

      $socket.emit("post-added", {
        champ: result.champ,
        champ_name: result.champ_name,
        date: result.date,
        ecup: result.ecup,
        ecup_name: result.ecup_name,
        images: result.images,
        slug: result.slug,
        title: result.title,
      });
    }

    filter(null, null);

    closeModal();

    $showToast('Сохранено успешно', 'success', 2000);

  } catch (e) {

    if (e.response.status === 422) {

      $showToast(e.response._data.msg, 'error');

    } else if (e.response.status === 403) {

      $showToast('Доступ запрещен', 'error');

      $logOut();

      await router.replace('/404');

    } else {

      $showToast('Ошибка', 'error', 2000);

    }

  }
}

async function removeItem(dbId) {

  if (confirm('Are you sure?')) {
    try {

      // const formData = new FormData();
      //formData.append('id', dbId);

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/posts/remove', {
        method: 'DELETE',
        body: dbId,
      })

      data.value.posts.splice(data.value.posts.findIndex(item => item.id === id), 1);

      filter(null, null);

      $showToast('Успешно удалено', 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {

        $showToast('Доступ запрешен', 'error');

        $logOut();

        await router.replace('/404')

      }
    }
  }
}

</script>


