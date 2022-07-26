<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Чемпионаты
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
        <input type="text" v-model.trim="champToUpdate.name" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Api id</label>
        <input type="text" v-model.trim="champToUpdate.api_id" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Текущий тур</label>
        <input type="text" v-model.trim="champToUpdate.current_tour" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Всего туров</label>
        <input type="text" v-model.trim="champToUpdate.all_tours" class="form-control " id="title">
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
                   :data="champs"
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
              <strong>Текущий тур</strong>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>Всего туров</strong>
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

const {$showToast, $logOut} = useNuxtApp();

const router = useRouter();

definePageMeta({
  layout: 'admin'
})


const {data: champs, error} = await useAsyncData('adminChamps', () => $fetch('/api/admin/champs'));


const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const champToUpdate = ref({});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  champToUpdate.value = {slug: null};
}

async function updateItem(champ) {
  mode.value = 'edit';
  champToUpdate.value = {...champ}

  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  champToUpdate.value = {}
}


async function storeItem() {

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/champs/edit', {
        method: 'PUT',
        body: champToUpdate.value,
      })
      const ind = champs.value.findIndex(item => item.slug === result.slug);
      champs.value[ind] = result;
    }

    if (mode.value === 'add') {

      const {result} = await $fetch('/api/admin/champs/add', {
        method: 'POST',
        body: champToUpdate.value,
      })
      champs.value.unshift(result);
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

      const {id} = await $fetch('/api/admin/champs/remove', {
        method: 'DELETE',
        body: slug,
      })

      champs.value.splice(champs.value.findIndex(item => item.slug === id), 1);

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


