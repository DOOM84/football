<template>
  <main class="withFooter text-center">
    <p class="text-3xl my-3 text-zinc-800">
      Команды
    </p>
    <div v-if="pending || !data">
      <TheLoading loader="dots"/>
    </div>
    <template v-else>
      <div class="text-right">
        <button
            class="btn font-bold"
            type="button"
            @click.prevent="addItem">
          Добавить команду
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>
              <div v-if="mode==='edit'" class="text-right">
                <button
                        class="btn font-bold mx-3"
                        type="button"
                        @click.prevent="getSquad">
                  Показать состав
                </button>
                <button
                        class="btn font-bold"
                        type="button"
                        @click.prevent="addSquad">
                  Добавить состав
                </button>
              </div>
              <div v-if="mode === 'edit'" class="form-group flex justify-center mt-3">
                <img :src="teamToUpdate.img" width="151"  alt="">
              </div>

              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="teamToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label>Чемпионат</label>
                <Multiselect
                    v-model="teamToUpdate.champ.slug"
                    :options="data.champs"
                    :searchable="true"
                    valueProp="slug"
                    label="name"
                    @change="champChanged"
                    placeholder="Выберите чемпионат">
                </Multiselect>
              </div>

              <div class="my-3">
                <label for="sprite">Координаты иконки в спрайте</label>
                <input type="text" v-model.trim="teamToUpdate.sprite" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="sprite">
              </div>

              <div class="flex justify-center my-3" v-if="picToLoad">
                <div v-if="showSpinner" class="text-center">
                  <Icon name="svg-spinners:12-dots-scale-rotate" size="40"/>
                </div>
                <img :src="picToLoad" width="200" alt="">
              </div>

              <div class="my-3">
                <label for="img" class="block">Изображение</label>
                <input id="img" type="file" accept="image/jpeg"
                       @change="handleFileChange">
              </div>

              <div class="my-3">
                <label for="api_id">Api id</label>
                <input type="text" v-model.trim="teamToUpdate.api_id" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="api_id">
              </div>

              <div class="flex my-3 justify-center gap-2">
                <div>
                  <label for="games">И</label>
                  <input min="0" class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" type="number"
                         v-model.trim="teamToUpdate.games" id="games">
                </div>
                <div>
                  <label for="win">В</label>
                  <input min="0" class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" type="number"
                         v-model.trim="teamToUpdate.win" id="win">
                </div>

                <div>
                  <label for="draw">Н</label>
                  <input min="0" class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" type="number"
                         v-model.trim="teamToUpdate.draw" id="draw">
                </div>

                <div>
                  <label for="lost">П</label>
                  <input class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" min="0" type="number"
                         v-model.trim="teamToUpdate.lost" id="lost">
                </div>

                <div>
                  <label for="goals">З</label>
                  <input class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" min="0" type="number"
                         v-model.trim="teamToUpdate.goals" id="goals">
                </div>

                <div>
                  <label for="missed">Пр</label>
                  <input class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" min="0" type="number"
                         v-model.trim="teamToUpdate.missed" id="missed">
                </div>

                <div>
                  <label for="diff">Р</label>
                  <input class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" min="0" type="number"
                         v-model.trim="teamToUpdate.diff" id="diff">
                </div>

                <div>
                  <label for="points">О</label>
                  <input class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" min="0" type="number"
                         v-model.trim="teamToUpdate.points" id="points">
                </div>
              </div>

              <div class="my-3">
                <label for="order">Место в чемпионате</label>
                <input class="block
              w-20 h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" min="0" type="number"
                       v-model.trim="teamToUpdate.order" id="order">
              </div>

              <div class="my-3">
                <label for="coach">Тренер</label>
                <input type="text" v-model.trim="teamToUpdate.team_info.coach" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="coach">
              </div>

              <div class="my-3">
                <label for="pres">Президент</label>
                <input type="text" v-model.trim="teamToUpdate.team_info.pres" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="pres">
              </div>

              <div class="my-3">
                <label for="stad">Стадион</label>
                <input type="text" v-model.trim="teamToUpdate.team_info.stad" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="stad">
              </div>

              <div class="my-3">
                <label for="year">Год основания</label>
                <input type="text" v-model.trim="teamToUpdate.team_info.year" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="year">
              </div>

              <div class="my-3">
                <label for="site">Сайт</label>
                <input type="text" v-model.trim="teamToUpdate.team_info.site" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="site">
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="teamToUpdate.status" id="status">
              </div>
              <button
                  type="button"
                  class="btn mt-5 w-full font-bold"
                  @click.prevent="storeItem">
                Save
              </button>

              <div class="px-1 my-4 flex flex-wrap text-center justify-center gap-4 ">
                <div class="shadow-md shadow-zinc-800/20" v-for="player in teamSquad" :key="player.slug">
                  <ThePlayerCard :player="player">
                    <div class="flex flex-wrap flex-col gap-1">
                      <button @click="addPlayerInfo(player.api_id as number)" class="btn font-bold mx-3 p-1 bg-blue-100 hover:bg-blue-50">
                        <span class="text-emerald-700">Добавить Инфо</span>
                      </button>
                      <button @click="removeFromTeam(player.api_id as number)" class="btn font-bold mx-3 p-1 bg-blue-100 hover:bg-blue-50 ">
                       <span class="text-orange-800">Удалить из команды</span>
                      </button>
                      <button @click="removePlayer(player.api_id as number)" class="btn font-bold mx-3 p-1 bg-blue-100 hover:bg-blue-50">
                        <span class="text-red-600">Удалить полностью</span>
                      </button>
                    </div>
                  </ThePlayerCard>
                </div>
              </div>

            </template>
          </TheModal>
        </Teleport>
        <AdminDtable v-if="showTable" @endFilter="toFilter = false"
                     :data="data.teams"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <Icon @click.prevent="filter('name', 'asc')" name="ant-design:caret-up-filled"
                      class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('name', 'desc')" name="ant-design:caret-down-filled"
                      class="cursor-pointer"
                      size="10"/>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Изображение</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Опубликовано</strong>
                <Icon @click.prevent="filter('status', 'asc')" name="ant-design:caret-up-filled"
                      class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('status', 'desc')" name="ant-design:caret-down-filled"
                      class="cursor-pointer"
                      size="10"/>
              </div>
            </table-head>
            <table-head/>
          </template>

          <template #rows="{row}">
            <table-body>
              {{ row.name }}
            </table-body>

            <table-body>
              <div class="flex justify-center">
                <img :src="row.img" width="150" alt="">
              </div>
            </table-body>

            <table-body>
              {{ row.status ? 'Да' : 'Нет' }}
            </table-body>

            <table-body>
              <button @click.prevent="updateItem(row)">
                <Icon name="material-symbols:edit-square-outline" size="20"/>
              </button>
              <button @click.prevent="removeItem(row.id, row.img)">
                <Icon name="ion:trash-b" size="20"/>
              </button>
            </table-body>
          </template>
        </AdminDtable>
      </ClientOnly>
    </template>


  </main>
</template>

<script lang="ts" setup>
import slugify from "slugify";
import type {IError, IChampDB, IPlayer} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";
import Multiselect from '@vueform/multiselect';
import type {ITeamInfo} from "~/types/interfaces";

definePageMeta({
  layout: 'admin',
  middleware: ["auth"]
})

const {data, pending} = useLazyFetch<{teams: Partial<ITeamInfo>[], champs: Partial<IChampDB>[]}>('/api/admin/teams')

const showTable = ref<boolean>(true);

const showSpinner = ref<boolean>(false);

const picToLoad = ref<string>();

const teamSquad = ref<IPlayer[]>([])

const selectedFile = ref<File>();

useHead({
  titleTemplate: '%s - Команды'
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const teamToUpdate = ref<Partial<ITeamInfo>>({status: false, name: ''});

const showLoading = ref<boolean>(false);

function closeModal(): void {
  teamToUpdate.value = {status: false, name: ''}
  picToLoad.value = '';
  showDlg.value = false;
  mode.value = null;
  teamSquad.value = [];
  selectedFile.value = undefined;
}

function updateItem(team: ITeamInfo): void {
  mode.value = 'edit';

  teamToUpdate.value = JSON.parse(JSON.stringify(team));

  if (!teamToUpdate.value.champ) {
    teamToUpdate.value.champ = {slug: '', name: ''};
  }

  showDlg.value = true;
}

function champChanged(champ: any): void {
  if (!champ) {
    teamToUpdate.value.champ = {slug: '', name: ''};
    teamToUpdate.value.champ_id = null;
    return
  }
  teamToUpdate.value.champ = {...data.value?.champs[data.value.champs.findIndex(ch => ch.slug === champ)]} as {name: string; slug: string; id: number};
  teamToUpdate.value.champ_id = teamToUpdate.value.champ?.id;
}

function addItem(): void {
  mode.value = 'add';
  teamToUpdate.value = {status: true, team_info: {}, champ:{slug:'', name: ''}}
  showDlg.value = true;
}

async function addSquad(): Promise<void> {

  try {
    showLoading.value = true;

    const {players}= await $fetch<{ players: IPlayer[] }>('/api/admin/remote/teamSquad',
        {params: {teamApiId: teamToUpdate.value.api_id, teamId: teamToUpdate.value.id}});

    teamSquad.value = [...players]


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


async function addPlayerInfo(playerApiId: number): Promise<void> {

  try {
    showLoading.value = true;

    const {player}= await $fetch<{ player: IPlayer }>('/api/admin/remote/playerInfo',
        {params: {teamApiId: teamToUpdate.value.api_id, playerApiId: playerApiId}});


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


async function getSquad(): Promise<void> {

  try {
    showLoading.value = true;

    const {players}= await $fetch<{ players: IPlayer[] }>('/api/admin/teams/getSquad',
        {params: {teamId: teamToUpdate.value.id}});

    teamSquad.value = [...players]

  } catch (e) {
   // console.log(e);
    throw createError({
      fatal: true,
      statusCode: 404,
      statusMessage: 'Страница не найдена'
    })
  } finally {
    showLoading.value = false;
  }

}

async function removeFromTeam(playerApiID: number): Promise<void> {

  try {
    showLoading.value = true;

    await $fetch<{ player: IPlayer }>('/api/admin/remote/removeFromTeam',
        {
          method: 'PUT',
          body: {apiId: playerApiID},
        });

      teamSquad.value.splice(teamSquad.value.findIndex((item) => item.api_id === +playerApiID), 1);


  } catch (e) {
    console.log(e);
  } finally {
    showLoading.value = false;
  }

}

async function removePlayer(playerApiID: number): Promise<void> {

  try {
    showLoading.value = true;

    await $fetch<{ player: IPlayer }>('/api/admin/remote/removePlayer',
        {
          method: 'DELETE',
          body: {apiId: playerApiID},
        });

    teamSquad.value.splice(teamSquad.value.findIndex((item) => item.api_id === +playerApiID), 1);

  } catch (e) {
    console.log(e);
  } finally {
    showLoading.value = false;
  }

}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    const teamToDb = {
      id: teamToUpdate.value.id,
      name: teamToUpdate.value.name,
      api_id: +teamToUpdate.value.api_id!,
      slug: teamToUpdate.value.slug || slugify(teamToUpdate.value?.name as string || '', {strict: true, lower:true}),
      img: teamToUpdate.value.img,
      sprite: teamToUpdate.value.sprite,
      champ_id: teamToUpdate.value.champ_id,
      games: teamToUpdate.value.games,
      win: teamToUpdate.value.win,
      draw: teamToUpdate.value.draw,
      lost: teamToUpdate.value.lost,
      goals: teamToUpdate.value.goals,
      missed: teamToUpdate.value.missed,
      diff: teamToUpdate.value.diff,
      points: teamToUpdate.value.points,
      order: teamToUpdate.value.order,
      team_info: teamToUpdate.value.team_info,
      status: teamToUpdate.value.status,
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(teamToDb))

    if (selectedFile.value) {
      formData.append('media_file', selectedFile.value as File)
    }

    showTable.value = false;

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: ITeamInfo }>('/api/admin/teams/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind: number = data.value?.teams.findIndex((team: Partial<ITeamInfo>) => team.id === teamToUpdate.value.id) as number;

      if(data.value){
        data.value.teams[ind] = {...teamToUpdate.value, img: result.img};
      }
    } else if (mode.value === 'add') {
      const {result} = await $fetch<{ result: ITeamInfo }>('/api/admin/teams/add', {
        method: 'POST',
        body: formData,
      })
      if(data.value){
        data.value.teams.unshift({...teamToUpdate.value, img: result.img, id: result.id});
      }
    }

    closeModal();

    useNuxtApp().$toast.success('Сохранено успешно!');

  } catch (e) {

    console.log(e);

    const typedError = e as IError;
    useNuxtApp().$toast.error(typedError.response?._data?.message as string);

  } finally {
    showLoading.value = false;
    showTable.value = true;
  }
}

async function removeItem(dbId: number, path: string): Promise<void> {

  if (confirm('Are you sure?')) {
    try {
      showLoading.value = true;
      //useNuxtApp().$toast.info('Processing...');

      const {id} = await $fetch<{ id: number }>('/api/admin/teams/remove', {
        method: 'DELETE',
        body: {id: dbId, path},
      })

      showTable.value = false;

      if(data.value){
        data.value.teams.splice(data.value.teams.findIndex((item) => item.id === +id), 1);
      }

      filter('', '');

      useNuxtApp().$toast.success('Completed!');

    } catch (e) {

      const typedError = e as IError;

      useNuxtApp().$toast.error(typedError.response?._data?.message as string);

    } finally {
      showLoading.value = false;
      showTable.value = true;
    }
  }
}

function handleFileChange(event: { target: { files: (File | undefined)[]; }; }): void {

  /* [...event.target.files].forEach((mediaFile, index) => {
     //form.append('media_file_' + index, mediaFile)
   })*/

  picToLoad.value = '';

  selectedFile.value = event.target.files[0]

  const file = event.target.files[0]

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

</script>

<style>

</style>