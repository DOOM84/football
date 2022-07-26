<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Еврокубки
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

      <div class="form-group left">
        <label for="title">Название</label>
        <input type="text" v-model.trim="ecupToUpdate.name" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Api id</label>
        <input type="text" v-model.trim="ecupToUpdate.api_id" class="form-control " id="title">
      </div>

      <div class="form-group mt-2">
        <label>Стадия турнира</label>
        <Multiselect
            v-model="ecupToUpdate.stage"
            :options="stages"
            :searchable="true"
            valueProp="slug"
            label="name"
            placeholder="Выберите стадию турнира"></Multiselect>
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
                   :data="ecups"
                   :toFilter="toFilter"
                   :filtering="filtering"
                   :toSearch="['name']">
        <template #thead>
          <table-head>
            <div class="flexCentered">
              <strong>Название</strong>
              <i @click.self="filter('name', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
              <i @click.self="filter('name', 'desc')" class="fa fa-caret-down pointer"></i>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>Api id</strong>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>Стадия</strong>
            </div>
          </table-head>
          <table-head/>
        </template>

        <template #rows="{row}">
          <table-body>
            {{ row.name }}
          </table-body>
          <table-body>
            {{row.api_id}}
          </table-body>
          <table-body>
            {{row.stage}}
          </table-body>
          <table-body>
            <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
            <button @click.prevent="removeItem(row.slug)" class="button block btn-dark"><i class="fas fa-trash"></i>
            </button>
          </table-body>
        </template>
      </AdminDtable>
    </ClientOnly>
  </main>
</template>
<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import Multiselect from '@vueform/multiselect';

const {$showToast, $logOut} = useNuxtApp();

const router = useRouter();

definePageMeta({
  layout: 'admin'
})


const {data: ecups, error} = await useAsyncData('adminEcups', () => $fetch('/api/admin/ecups'));

const stages = [{name: 'Групповой турнир', slug: 'group'},{name: 'Плей-офф', slug: 'playoff'}];

const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const ecupToUpdate = ref({});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  ecupToUpdate.value = {slug: null};
}

async function updateItem(ecup) {
  mode.value = 'edit';
  ecupToUpdate.value = {...ecup}

  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  ecupToUpdate.value = {}
}


async function storeItem() {

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/ecups/edit', {
        method: 'PUT',
        body: ecupToUpdate.value,
      })
      const ind = ecups.value.findIndex(item => item.slug === result.slug);
      ecups.value[ind] = result;
    }

    if (mode.value === 'add') {

      const {result} = await $fetch('/api/admin/ecups/add', {
        method: 'POST',
        body: ecupToUpdate.value,
      })
      ecups.value.unshift(result);
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

async function removeItem(slug) {

  if (confirm('Are you sure?')) {
    try {

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/ecups/remove', {
        method: 'DELETE',
        body: slug,
      })

      ecups.value.splice(ecups.value.findIndex(item => item.slug === id), 1);

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


