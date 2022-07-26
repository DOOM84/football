<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Команды (Еврокубки)
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

      <div v-if="mode === 'edit'" class="center">
        <img class="team-logo" :alt="teamToUpdate.name" :title="teamToUpdate.name"
             src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
             :style="`background: url('/teams.png') ${teamToUpdate.sprite};`"/>
      </div>

      <div class="form-group mt-2">
        <label>Команда чемпионата</label>
        <Multiselect
            v-model="teamToUpdate.api_id"
            :options="data.teams"
            :searchable="true"
            valueProp="api_id"
            label="name"
            @change="teamChanged"
            :disabled="mode === 'edit'"
            placeholder="Выберите команду чемпионата"></Multiselect>
      </div>

      <div class="form-group left">
        <label for="title">Название</label>
        <input type="text" v-model.trim="teamToUpdate.name" class="form-control " id="title">
      </div>


      <div class="form-group left">
        <label for="title">Координаты иконки в спрайте</label>
        <input type="text" v-model.trim="teamToUpdate.sprite" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Api id</label>
        <input type="text" v-model.trim="teamToUpdate.api_id" class="form-control " id="title">
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
                   :data="data.ecupTeams"
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
              <strong>Лого</strong>
            </div>
          </table-head>
          <table-head/>
        </template>

        <template #rows="{row}">
          <table-body>
            {{ row.name }}
          </table-body>
          <table-body>
            <img class="teamLogo" :alt="row.name" :title="row.name"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                 :style="`background: url('/teams.png') ${row.sprite};`"/>
          </table-body>
          <table-body>
            <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
            <button @click.prevent="removeItem(row.api_id)" class="button block btn-dark"><i class="fas fa-trash"></i>
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

const {$showToast, $logOut} = useNuxtApp();

const router = useRouter();

definePageMeta({
  layout: 'admin'
})


const {data, error} = await useAsyncData('adminEcupTeams', () => $fetch('/api/admin/ecup_teams'));


const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const teamToUpdate = ref({slug: null});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  teamToUpdate.value = {slug: null};
}

async function updateItem(team) {
  mode.value = 'edit';
  teamToUpdate.value = {...team}

  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  teamToUpdate.value = {slug: null}
}

function teamChanged(team) {
  teamToUpdate.value = {...data.value.teams[data.value.teams.findIndex(tm => tm.api_id === team)]}

  teamToUpdate.value.slug = teamToUpdate.value.slug || null;
}


async function storeItem() {

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/ecup_teams/edit', {
        method: 'PUT',
        body: teamToUpdate.value,
      })
      const ind = data.value.ecupTeams.findIndex(item => item.api_id === result.api_id);
      data.value.ecupTeams[ind] = result;
    }

    if (mode.value === 'add') {

      const ind = data.value.ecupTeams.findIndex(item => +item.api_id === +teamToUpdate.value.api_id);

      if (ind > -1) {
        $showToast('Эта команда уже существует', 'error', 2000);
        return
      }

      const {result} = await $fetch('/api/admin/ecup_teams/add', {
        method: 'POST',
        body: teamToUpdate.value,
      })
      data.value.ecupTeams.unshift(result);
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

async function removeItem(api_id) {

  if (confirm('Are you sure?')) {
    try {

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/ecup_teams/remove', {
        method: 'DELETE',
        body: api_id,
      })

      data.value.ecupTeams.splice(data.value.ecupTeams.findIndex(item => item.api_id === id), 1);

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

<style scoped lang="scss">

.teamLogo {
  width: 35px;
  border: none !important;
}
</style>

