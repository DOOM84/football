<template>
  <div class="withFooter max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7">
      Комады (Еврокубки)
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
          Добавить команду
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>

              <div v-if="mode === 'edit'" class="flex justify-center">
                <img class="w-[30px] h-[30px]" :alt="ecupTeamToUpdate.name" :title="ecupTeamToUpdate.name"
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                     :style="`background: url('/teams.png') ${ecupTeamToUpdate.sprite};`"/>
              </div>

              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="ecupTeamToUpdate.name" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label>Команда Чемпионата</label>
                <Multiselect
                    v-model="ecupTeamToUpdate.team_id"
                    :options="data.teams"
                    :searchable="true"
                    valueProp="id"
                    label="name"
                    @change="teamChanged"
                    placeholder="Выберите команду чемпионата">
                  <template v-slot:option="{ option }">
                    <img class="h-[30px] w-[30px] mr-2" :alt="option.name" :title="option.name"
                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                         :style="`background: url('/teams.png') ${option.sprite};`"/> {{ option.name }}
                  </template>
                  <template v-slot:singlelabel="{ value }">
                    <div class="multiselect-single-label">
                      <img class="h-[30px] w-[30px] mr-2" :alt="value.name" :title="value.name"
                           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                           :style="`background: url('/teams.png') ${value.sprite};`"/>  {{ value.name }}
                    </div>
                  </template>

                </Multiselect>
              </div>

              <div class="my-3">
                <label for="api_id">Api id</label>
                <input type="text" v-model.trim="ecupTeamToUpdate.api_id" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="api_id">
              </div>

              <div class="my-3">
                <label for="sprite">Координаты иконки в спрайте</label>
                <input type="text" v-model.trim="ecupTeamToUpdate.sprite" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="sprite">
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="ecupTeamToUpdate.status" id="status">
              </div>
              <button
                  type="button"
                  class="btn mt-5 w-full font-bold"
                  @click.prevent="storeItem">
                Save
              </button>
            </template>
          </TheModal>
        </Teleport>
        <AdminDtable @endFilter="toFilter = false"
                     :data="data.ecupTeams"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['name']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.ecupTeams && data.ecupTeams.length">
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
              <div class="flex justify-center items-center">
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
              <img class="h-[30px] w-[30px]" :alt="row.name" :title="row.name"
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                   :style="`background: url('/teams.png') ${row.sprite};`"/>
            </table-body>

            <table-body>
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
import type {IError, ITeamInfo} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";
import Multiselect from '@vueform/multiselect';

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const {data, pending} = useLazyFetch<{ecupTeams: Partial<ITeamInfo>[],
  teams: Partial<ITeamInfo>[]}>('/api/admin/ecupTeams')

useHead({
  titleTemplate: '%s - Команды (Еврокубки)'
})

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const initTeamData: Partial<ITeamInfo> = {name: '', slug: ''};

const ecupTeamToUpdate = ref<typeof initTeamData>({});

const showLoading = ref<boolean>(false);

function closeModal(): void {
  ecupTeamToUpdate.value = {...initTeamData};
  showDlg.value = false;
  mode.value = null;
}

function teamChanged(team: any) {

  if (!team) {
    ecupTeamToUpdate.value.team = {...initTeamData};
    ecupTeamToUpdate.value.team_id = null;
    ecupTeamToUpdate.value.api_id = null;
    return
  }

  ecupTeamToUpdate.value.team = {...data.value?.teams[data.value.teams.findIndex(tm => tm.id === team)]}
  ecupTeamToUpdate.value.team_id = team;
  ecupTeamToUpdate.value.api_id = ecupTeamToUpdate.value.team.api_id;
}

async function updateItem(ecupTeam: ITeamInfo) {
  mode.value = 'edit';

  ecupTeamToUpdate.value = JSON.parse(JSON.stringify(ecupTeam));

  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  ecupTeamToUpdate.value = {...initTeamData};
  showDlg.value = true;
}

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    const ecupTeamToDb = {
      id: ecupTeamToUpdate.value.id,
      api_id: +ecupTeamToUpdate.value.api_id!,
      name: ecupTeamToUpdate.value.name,
      sprite: ecupTeamToUpdate.value.sprite,
      team_id: ecupTeamToUpdate.value.team_id,
      status: ecupTeamToUpdate.value.status,
    }

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: ITeamInfo }>('/api/admin/ecupTeams/edit', {
        method: 'PUT',
        body: ecupTeamToDb,
      })
      const ind: number = data.value?.ecupTeams.findIndex((team: Partial<ITeamInfo>) => team.id === ecupTeamToUpdate.value.id) as number;

      if(data.value){
        data.value.ecupTeams[ind] = {...ecupTeamToUpdate.value};
      }

    } else if (mode.value === 'add') {
      const {result} = await $fetch<{ result: Partial<ITeamInfo> }>('/api/admin/ecupTeams/add', {
        method: 'POST',
        body: ecupTeamToDb,
      })
      if(data.value){
        data.value.ecupTeams.unshift({...ecupTeamToUpdate.value, id: result.id});
      }
    }
    filter('', '');
    closeModal();

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

async function removeItem(dbId: number): Promise<void> {

  if (confirm('Are you sure?')) {
    try {
      showLoading.value = true;
      //useNuxtApp().$toast.info('Processing...');

      const {id} = await $fetch<{ id: number }>('/api/admin/ecupTeams/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })

      if(data.value){
        data.value.ecupTeams.splice(data.value.ecupTeams.findIndex((item) => item.id === +id), 1);
      }

      filter('', '');

      useNuxtApp().$toast.success('Completed!');

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
}

</script>

<style>

</style>