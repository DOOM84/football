<template>
  <main class="center pb-2 adminHome">
    <h1 class="mt-2 left pb-1 mb-2 pl-2 pr-2 admin-title">
      Команды
    </h1>

    <div class="right">
      <button
          type="button"
          class="button btn-dark"

          @click.prevent="addItem">
        Добавить
      </button>
      <button
          type="button"
          class="ml-1 button btn-dark"

          @click.prevent="checkDoubles">
        Проверить копии игроков
      </button>
    </div>

    <div v-if="doubles.length" v-for="player in doubles">
      {{ player.id }} - {{ player.slug }}
      <button @click="removeDouble(player.slug)">Удалить</button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">

      <div v-if="mode === 'edit'" class="right">
        <button
            type="button"
            class="button btn-dark mr-1"

            @click.prevent="showSquad(teamToUpdate.slug)">
          Состав
        </button>
        <button
            type="button"
            class="button btn-dark"

            @click.prevent="addSquad(teamToUpdate.api_id, teamToUpdate.slug)">
          Добавить состав
        </button>
      </div>

      <div v-if="mode === 'edit'" class="flexCentered">
        <img class="pic-thumb" :src="teamToUpdate.img" alt="">
      </div>


      <div class="form-group left">
        <label for="title">Название</label>
        <input type="text" v-model.trim="teamToUpdate.name" class="form-control " id="title">
      </div>

      <div class="form-group mt-2">
        <label>Чемпионат</label>
        <Multiselect
            v-model="teamToUpdate.champ"
            :options="data.champs"
            :searchable="true"
            valueProp="slug"
            label="name"
            @change="champChanged"
            :disabled="mode === 'edit'"
            placeholder="Выберите чемпионат"></Multiselect>
      </div>


      <div class="form-group left">
        <label for="title">Координаты иконки в спрайте</label>
        <input type="text" v-model.trim="teamToUpdate.sprite" class="form-control " id="title">
      </div>

      <div class="form-group">
        <label for="file">Изображение</label>
        <input class="mr-1" ref="file" type="file" id="file" @change="onFileChange"/>
      </div>

      <div class="form-group left">
        <label for="title">Api id</label>
        <input type="text" v-model.trim="teamToUpdate.api_id" class="form-control " id="title">
      </div>

      <div class="d-flex mt-1 mb-1 g-1 f-wrap justify-center">
        <div>
          <label for="title" class="d-block">И</label>
          <input min="0" class="center inputInfo" type="number"
                 v-model.trim="teamToUpdate.games" id="title">
        </div>
        <div>
          <label for="title" class="d-block">В</label>
          <input min="0" class="center inputInfo" type="number"
                 v-model.trim="teamToUpdate.win" id="title">
        </div>

        <div>
          <label for="title" class="d-block">Н</label>
          <input min="0" class="center inputInfo" type="number"
                 v-model.trim="teamToUpdate.draw" id="title">
        </div>

        <div>
          <label for="title" class="d-block">П</label>
          <input class="center inputInfo" min="0" type="number"
                 v-model.trim="teamToUpdate.lost" id="title">
        </div>

        <div>
          <label for="title" class="d-block">З</label>
          <input class="center inputInfo" min="0" type="number"
                 v-model.trim="teamToUpdate.goals" id="title">
        </div>

        <div>
          <label for="title" class="d-block">Пр</label>
          <input class="center inputInfo" min="0" type="number"
                 v-model.trim="teamToUpdate.missed" id="title">
        </div>

        <div>
          <label for="title" class="d-block">Р</label>
          <input class="center inputInfo" min="0" type="number"
                 v-model.trim="teamToUpdate.diff" id="title">
        </div>

        <div>
          <label for="title" class="d-block">О</label>
          <input class="center inputInfo" min="0" type="number"
                 v-model.trim="teamToUpdate.points" id="title">
        </div>

      </div>

      <div class="form-group left">
        <label for="title">Тренер</label>
        <input type="text" v-model.trim="teamToUpdate.team_info.coach" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Президент</label>
        <input type="text" v-model.trim="teamToUpdate.team_info.pres" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Стадион</label>
        <input type="text" v-model.trim="teamToUpdate.team_info.stad" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Год основания</label>
        <input type="text" v-model.trim="teamToUpdate.team_info.year" class="form-control " id="title">
      </div>

      <div class="form-group left">
        <label for="title">Сайт</label>
        <input type="text" v-model.trim="teamToUpdate.team_info.site" class="form-control " id="title">
      </div>

      <div class="right mt-2 mr-2 admin-opts">
        <div>
          <label for="status" class="admin-status">Опубликовано</label>
          <input type="checkbox" v-model="teamToUpdate.status" id="status">
        </div>
      </div>

      <button
          type="button"
          class="button btn-dark w100 mt-1"
          @click.prevent="storeItem">
        Сохранить
      </button>

      <div id="players" class="row-content mt-2">
        <template v-for="player in players">
          <div>
            <ThePlayerCard @editSlug="editSlug" @removePlayer="removePlayer" :showSlug="true" :showDelete="true"
                           :player="player"/>
            <button @click="addPlayerInfo(teamToUpdate.api_id, teamToUpdate.slug, player.id)" class="button">Добавить
              информацию
            </button>
          </div>
        </template>

      </div>


    </AdminModalWrap>

    <ClientOnly>
      <AdminDtable @endFilter="toFilter = false"
                   :data="data.teams"
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
            {{ row.name }}
          </table-body>
          <table-body>
            <img class="pic-thumb" :src="row.img" alt="">
          </table-body>
          <table-body>
            {{ row.status ? 'Да' : 'Нет' }}
          </table-body>
          <table-body>
            <button @click.prevent="updateItem(row)" class="button block btn-dark"><i class="fas fa-edit"></i></button>
            <button @click.prevent="removeItem(row.slug, row.champ)" class="button block btn-dark"><i
                class="fas fa-trash"></i>
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
const file = ref(null);
const selectedFile = ref(null);
const players = ref([]);
const doubles = ref([]);

definePageMeta({
  layout: 'admin'
})


const {data, error} = await useAsyncData('adminTeams', () => $fetch('/api/admin/teams'));


const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const teamToUpdate = ref({status: true});
const showDlg = ref(false);
const mode = ref(null);

function onFileChange(e) {
  selectedFile.value = file.value.files[0];
}


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  teamToUpdate.value = {status: false, team_info: {}};
  players.value = [];
  selectedFile.value = null;
}

async function updateItem(team) {
  mode.value = 'edit';
  teamToUpdate.value = {...team, team_info: team.team_info || {}}

  showDlg.value = true;
}


function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  teamToUpdate.value = {status: true, team_info: {}}
}

async function showSquad(team) {

  players.value = await $fetch('/api/admin/teams/squad', {params: {team}});

  if (!players.value.length) {
    $showToast('Состав не добавлен', 'info', 2000);
  }

}

function champChanged(champ) {

  if (!champ) {
    teamToUpdate.value.champ_name = null;
    teamToUpdate.value.champ = null;
    return
  }

  teamToUpdate.value.champ_name = data.value.champs[data.value.champs.findIndex(ch => ch.slug === champ)].name;
}

async function addSquad(api_id, team) {

  try {
    players.value = await $fetch('/api/admin/teams/add_squad', {params: {api_id, team}});
    //$scrollTo('#players', 800, {offset: -50});
  } catch (e) {
    players.value = [];
    $showToast('Что-то пошло не так...', 'error', 2000);
  }

}


async function addPlayerInfo(api_id, team, playerId) {

  try {
    await $fetch('/api/admin/teams/add_player_info', {params: {api_id, team, playerId}})
  } catch (e) {
    $showToast('Что-то пошло не так...', 'error', 2000);
  }

}

async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(teamToUpdate.value))

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }

  try {
    $showToast('Обработка...', 'info', 2000);

    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/teams/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind = data.value.teams.findIndex(item => item.slug === result.slug);
      data.value.teams[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/teams/add', {
        method: 'POST',
        body: formData,
      })
      data.value.teams.unshift(result);
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

async function removeItem(slug, champ) {

  if (confirm('Are you sure?')) {
    try {

      $showToast('Обработка...', 'info', 2000);

      const {id} = await $fetch('/api/admin/teams/remove', {
        method: 'DELETE',
        body: {slug, champ},
      })

      data.value.teams.splice(data.value.teams.findIndex(item => item.slug === id), 1);

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

async function checkDoubles() {
  try {
    $showToast('Выполняется...', 'info', 4000);

    const results = await $fetch('/api/admin/teams/doubles');

    doubles.value.push(...results);

    $showToast('Успешно', 'success', 2000);

  } catch (e) {

    if (e.response.status === 403) {

      $showToast('Доступ запрешен', 'error');

      $logOut();

      await router.replace('/404')

    }
  }
}

async function removeDouble(slug) {
  try {

    const {id} = await $fetch('/api/admin/teams/remove_double', {
      method: 'DELETE',
      body: {slug},
    })

    doubles.value.splice(doubles.value.findIndex(item => item.slug === id), 1);

    $showToast('Успешно', 'success', 2000);

  } catch (e) {

    if (e.response.status === 403) {

      $showToast('Доступ запрешен', 'error');

      $logOut();

      await router.replace('/404')

    }
  }
}

async function editSlug(data) {

  try {

    const {id} = await $fetch('/api/admin/teams/player_slug', {
      method: 'PUT',
      body: {playerId: data.id, teamSlug: teamToUpdate.value.slug, playerSlug: data.slug},
    })

    $showToast('Успешно изменено', 'success', 2000);

  } catch (e) {

    if (e.response.status === 403) {

      $showToast('Доступ запрешен', 'error');

      $logOut();

      await router.replace('/404')

    }
  }

}

async function removePlayer(playerId) {
  try {

    const {id} = await $fetch('/api/admin/teams/remove_player', {
      method: 'DELETE',
      body: {playerId, teamSlug: teamToUpdate.value.slug},
    })

    players.value.splice(players.value.findIndex(item => item.id === id), 1);

    $showToast('Успешно удалено', 'success', 2000);

  } catch (e) {

    if (e.response.status === 403) {

      $showToast('Доступ запрешен', 'error');

      $logOut();

      await router.replace('/404')

    }
  }
}

</script>

<style scoped lang="scss">
.pic-thumb {
  max-width: 150px !important;
  border: none !important;
}

.inputInfo {
  font-size: 1rem;
  max-width: 3rem;
  max-height: 2rem;
}
</style>

