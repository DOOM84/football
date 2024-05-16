<template>
  <div class="min-h-[calc(100vh-160px)] max-w-[1300px] px-3 md:px-10 text-white m-auto">
    <div class="text-3xl font-bold border-solid border-b border-zinc-50/50 p-7 mb-7">
      Новости
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
          Добавить пост
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal class="text-zinc-800" :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>
              <div class="relative">
                <ClientOnly>
                  <TheLoading :show-load="showLoading" :full-page="false"/>
                </ClientOnly>

                <div v-if="postToUpdate.img?.original" class="flex justify-center my-3">
                  <img :src="postToUpdate.img.original" width="400" alt="">
                </div>

                <div class="flex justify-center my-3" v-if="picToLoad">
                  <div v-if="showSpinner" class="text-center">
                    <Icon name="svg-spinners:12-dots-scale-rotate" size="40"/>
                  </div>
                  <img :src="picToLoad" width="200" alt="postPic">
                </div>

                <div class="my-3">
                  <label for="img" class="block">Изображение</label>
                  <input id="img" type="file" accept="image/jpeg"
                         @change="handleFileChange">
                </div>

                <div class="my-3 ">
                  <label for="ua-title">Название</label>
                  <input type="text" v-model.trim="postToUpdate.title" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
                </div>
                <div class="my-3 ">
                  <label for="ua-det">Описание</label>
                  <input type="text" v-model.trim="postToUpdate.subtitle" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="ua-det">
                </div>

                <div class="my-3">
                  <label>Теги</label>
                  <Multiselect
                      id="tags"
                      v-model="postToUpdate.tags"
                      :object="true"
                      mode="tags"
                      valueProp="slug"
                      :searchable="true"
                      :create-option="true"
                      :options="data.tags"
                      @change="tagChanged"
                      label="name"
                  />
                </div>

                <div class="my-3">
                  <label for="title">Текст новости</label>
                  <AdminTheEditor @updatedContent="updatedContent" :content="postToUpdate.body!"></AdminTheEditor>
                </div>


                <div class="my-3">
                  <label for="source">Источник</label>
                  <input type="text" v-model.trim="postToUpdate.source" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="source">
                </div>

                <div class="text-right">
                  <label for="status">Опубликовано</label>
                  <input type="checkbox" v-model="postToUpdate.status" id="status">
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
                     :data="data.posts"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['title']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Изображение</strong>
              </div>
            </table-head>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <template v-if="data.posts && data.posts.length">
                  <Icon @click.prevent="filter('title', 'asc')" name="ant-design:caret-up-filled"
                        class="cursor-pointer ml-1"
                        size="10"/>
                  <Icon @click.prevent="filter('title', 'desc')" name="ant-design:caret-down-filled"
                        class="cursor-pointer"
                        size="10"/>
                </template>
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
              </div>
            </table-head>
            <table-head/>
          </template>
          <template #rows="{row}">
            <table-body class="text-center">
              {{ row.title }}
            </table-body>
            <table-body class="text-center">
              <div class="flex justify-center">
                <img :src="row.img.thumbnail" width="200" alt="">
              </div>
            </table-body>

            <table-body class="text-center">
              {{ row.status ? 'Да' : 'Нет' }}
            </table-body>

            <table-body class="text-center">
              <div class="flex justify-center items-center gap-1">
                <button @click.prevent="updateItem(row)" class="p-1 border-none btn m-0">
                  <Icon name="material-symbols:edit-square-outline" size="20"/>
                </button>
                <button @click.prevent="removeItem(row.id, row.img)" class="p-1 border-none btn m-0">
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
import type {IError, IPost, ITag} from "~/types/interfaces";
import Multiselect from '@vueform/multiselect';
import slugify from "slugify";
import useFilter from "~/helpers/useFilter";
import removeDuplicates from "~/helpers/removeDuplicates";

definePageMeta({
  layout: 'admin',
  middleware: ["auth"]
})

const showSpinner = ref<boolean>(false);

const picToLoad = ref<string>();

const selectedFile = ref<File>();

const newTags = ref<ITag[]>();

useHead({
  script: [
    {
      src: '/scripts/ckeditor/ckeditor.js',
      defer: true,
    }
  ]
})

useSeoMeta({
  title: () => 'Блог',
})

const {data, pending} = await useLazyFetch<{ posts: Partial<IPost>[];
  champs: any, ecups: any, tags: ITag[]}>('/api/admin/posts')

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const showLoading = ref<boolean>(false);

const initPostData: Partial<IPost> = {
  title: '',
  subtitle: '',
  source: '',
  tags: [],
  teams: [],
  players: [],
  status: false,
  img: {
    original: '',
    thumbnail: '',
  }
}

const postToUpdate = ref<typeof initPostData>({});

function
closeModal(): void {
  showDlg.value = false;
  mode.value = null;
  postToUpdate.value = {...initPostData};
  selectedFile.value = undefined;
  picToLoad.value = '';
}

function updateItem(post: IPost): void {
  mode.value = 'edit';
  postToUpdate.value = {...post}
  showDlg.value = true;
}

function addItem(): void {
  mode.value = 'add';
  postToUpdate.value = {...initPostData};
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

  if(Array.isArray(newTags.value)){
    postToUpdate.value.tags = newTags.value as ITag[];
    postToUpdate.value.tags.map(t => {
      if(!data.value!.tags.find(tag => t.slug === tag?.slug)){
        data.value!.tags.push(t)
      }
    })
  }

  console.log(postToUpdate.value);
  return

  try {
    showLoading.value = true;

    useNuxtApp().$toast.info('Обработка...');

    postToUpdate.value.date = postToUpdate.value.date || Date.now();

    postToUpdate.value.slug = !postToUpdate.value.slug ?
        slugify(postToUpdate.value?.title as string || '', {strict: true, lower: true}) : postToUpdate.value.slug;

    const formData = new FormData();
    formData.append('data', JSON.stringify(postToUpdate.value))

    if (selectedFile.value) {
      formData.append('media_file', selectedFile.value as File)
    }

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: IPost }>('/api/admin/posts/edit', {
        method: 'PUT',
        body: formData,
      })
      //  if (data.value?.posts) {
      const ind: number = data.value!.posts.findIndex((item: IPost) => item.id === result.id);
      data.value!.posts[ind] = {
        ...postToUpdate.value,
        id: result.id,
        img: (result.img as IPost['img'])
      } as IPost;
      //  }
    }

    if (mode.value === 'add') {
      const {result} = await $fetch<{ result: IPost }>('/api/admin/posts/add', {
        method: 'POST',
        body: formData,
      })
      data.value!.posts.unshift({
        ...postToUpdate.value,
        id: result.id,
        images: (result.img as IPost['img'])
      } as IPost);
    }

    filter('', '');

    closeModal();

    useNuxtApp().$toast.success('Успешно!');

  } catch (e) {

    const typedError = e as IError;

    if (typedError.status === 403) {
      throw createError({
        fatal: true,
        statusCode: 404,
        message: 'Страница не найдена'
      })
    }

    if (typedError.response?._data?.message) {
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

      const {id} = await $fetch<{ id: number }>('/api/admin/posts/remove', {
        method: 'DELETE',
        body: {id: dbId, path},
      })

      data.value?.posts.splice(data.value.posts.findIndex((item: IPost) => item.id === id), 1);

      filter('', '');

      useNuxtApp().$toast.success('Успешно!');

    } catch (e) {

      const typedError = e as IError;

      if (typedError.status === 403) {
        throw createError({
          fatal: true,
          statusCode: 404,
          message: 'Страница не найдена'
        })
      }

      if (typedError.response?._data?.message) {
        useNuxtApp().$toast.error(typedError.response?._data?.message as string);
      }
    }
  }
}

function updatedContent(cont: string): void {
  postToUpdate.value.body = cont;
}

function tagChanged(tags: Partial<IPost['tags']>) {

  const tagsLowSlug = tags.map(tag =>
      ({
        ...tag,
        slug: data.value!.tags.find(t => t.slug === tag?.slug) ?
            tag!.slug : slugify(tag!.name,{strict: true, lower: true}),
      })
  );

  const filteredTags = removeDuplicates(tagsLowSlug, 'slug');

  newTags.value = [...filteredTags].map((t) => {delete t.id; return t;})
}

</script>


















<!--
<template>
  <main class="withFooter text-center">
    <p class="text-3xl my-3 text-zinc-800">
      Новости
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
          Добавить новость
        </button>
      </div>
      <ClientOnly>
        <Teleport to="body">
          <TheModal :show="showDlg" @close="closeModal" :showLoading="showLoading">
            <template #body>
              <div v-if="mode === 'edit'" class="form-group flex justify-center mt-3">
                <img :src="postToUpdate.img.thumbnail" width="200" height="89" alt="">
              </div>

              <div class="my-3">
                <label for="title">Название</label>
                <input type="text" v-model.trim="postToUpdate.title" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="my-3">
                <label for="subtitle">Описание</label>
                <input type="text" v-model.trim="postToUpdate.subtitle" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="subtitle">
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
                <label for="title">Текст новости</label>
                <AdminTheEditor @updatedContent="updatedContent" :content="postToUpdate.body!"></AdminTheEditor>
              </div>

              <div class="my-3">
                <label>Чемпионат</label>
                <Multiselect
                    v-model="postToUpdate.champ.slug"
                    :options="data.champs"
                    :searchable="true"
                    valueProp="slug"
                    label="name"
                    @change="champChanged"
                    placeholder="Выберите чемпионат">

                </Multiselect>
              </div>

              <div class="my-3">
                <label>Еврокубок</label>
                <Multiselect
                    v-model="postToUpdate.ecup.slug"
                    :options="data.ecups"
                    :searchable="true"
                    valueProp="slug"
                    label="name"
                    @change="ecupChanged"
                    placeholder="Выберите еврокубок">

                </Multiselect>
              </div>

              <div class="my-3">
                <label>Команды</label>
                <Multiselect
                    id="teams"
                    v-model="postToUpdate.teams"
                    :object="true"
                    mode="tags"
                    valueProp="slug"
                    :searchable="true"
                    :createTag="false"
                    :options="data.teams"
                    label="name"
                    @change="teamChanged"
                >
                  <template v-slot:option="{ option }">
                    <img class="character-option-icon" :src="option.img"> {{ option.name }}
                  </template>

                  <template v-slot:tag="{ option, handleTagRemove, disabled }">
                    <div
                        class="multiselect-tag is-user"
                        :class="{
          'is-disabled': disabled
        }"
                    >
                      <img :src="option.img">
                      {{ option.name }}
                      <span
                          v-if="!disabled"
                          class="multiselect-tag-remove"
                          @mousedown.prevent="handleTagRemove(option, $event)"
                      >
          <span class="multiselect-tag-remove-icon"></span>
        </span>
                    </div>
                  </template>
                </Multiselect>
              </div>

              <div class="my-3">
                <label>Игроки</label>
                <Multiselect
                    id="players"
                    v-model="postToUpdate.players"
                    :object="true"
                    mode="tags"
                    valueProp="slug"
                    :searchable="true"
                    :createTag="false"
                    :options="data.players"
                    @change="playerChanged"
                    label="name"
                >
                  <template v-slot:option="{ option }">
                    <img :alt="option.name" @error="imageUrlAlt" class="character-option-icon" :src="option.img"> {{ option.name }}
                  </template>

                  <template v-slot:tag="{ option, handleTagRemove, disabled }">
                    <div
                        class="multiselect-tag is-user"
                        :class="{
          'is-disabled': disabled
        }"
                    >
                      <img :src="option.img">
                      {{ option.name }}
                      <span
                          v-if="!disabled"
                          class="multiselect-tag-remove"
                          @mousedown.prevent="handleTagRemove(option, $event)"
                      >
          <span class="multiselect-tag-remove-icon"></span>
        </span>
                    </div>
                  </template>
                </Multiselect>
              </div>

              <div class="my-3">
                <label>Теги</label>
                <Multiselect
                    id="tags"
                    v-model="postToUpdate.tags"
                    :object="true"
                    mode="tags"
                    valueProp="slug"
                    :searchable="true"
                    :create-option="true"
                    :options="data.tags"
                    @change="tagChanged"
                    label="name"
                />
              </div>

              <div class="my-3">
                <label for="title">Источник</label>
                <input type="text" v-model.trim="postToUpdate.source" class="block
              w-full h-8 px-2 py-3 text-md text-zinc-800 border
              border-solid border-zinc-600/30 rounded-md" id="title">
              </div>

              <div class="text-right">
                <label for="status">Опубликовано</label>
                <input type="checkbox" v-model="postToUpdate.status" id="status">
              </div>
              <div class="text-right">
                <label for="headline">В карусели</label>
                <input type="checkbox" v-model="postToUpdate.is_headline" id="headline">
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
        <AdminDtable v-if="showTable" @endFilter="toFilter = false"
                     :data="data.posts"
                     :toFilter="toFilter"
                     :filtering="filtering"
                     :toSearch="['title']">
          <template #thead>
            <table-head>
              <div class="flex justify-center items-center">
                <strong>Название</strong>
                <Icon @click.prevent="filter('title', 'asc')" name="ant-design:caret-up-filled"
                      class="cursor-pointer ml-1"
                      size="10"/>
                <Icon @click.prevent="filter('title', 'desc')" name="ant-design:caret-down-filled"
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
              {{ row.title }}
            </table-body>
            <table-body>
              <div class="flex justify-center">
                <img :src="row.img.thumbnail" width="150" alt="">
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
import Multiselect from '@vueform/multiselect';
import slugify from "slugify";
import type {IChampDB, IEcupDB, IError, IPost, ITag, IPlayer} from "~/types/interfaces";
import useFilter from "~/helpers/useFilter";
import removeDuplicates from "~/helpers/removeDuplicates";
import { io, type Socket } from 'socket.io-client';

definePageMeta({
  layout: 'admin',
  middleware: ["auth"]
})
const socket = ref<Socket>();

const showTable = ref<boolean>(true);

const {filtering, toFilter, showDlg, mode, filter} = useFilter();

const postToUpdate = ref<Partial<IPost>>({status: false, title: '', body: ''});

const selectedFile = ref<File>();

const showSpinner = ref<boolean>(false);

const showLoading = ref<boolean>(false);

const picToLoad = ref<string>();

const {data, pending} = await useLazyFetch<{
  posts: Partial<IPost>[]; champs: IChampDB[], ecups: IEcupDB[],
  tags: ITag[]
}>('/api/admin/posts')

useHead({
  titleTemplate: '%s - Новости',
  script: [
    {
      src: '/scripts/ckeditor/ckeditor.js',
      defer: true,
    }
  ]
})


function champChanged(champ: any): void {
  if (!champ) {
    postToUpdate.value.champ = {slug: ''};
    postToUpdate.value.champ_id = null;
    return
  }
  postToUpdate.value.champ = {...data.value?.champs[data.value.champs.findIndex(ch => ch.slug === champ)]};
  postToUpdate.value.champ_id = postToUpdate.value.champ.id;
}

async function teamChanged(teams: Partial<IPost['teams']> /*teams*/): Promise<void> {
  if (!Array.isArray(teams) || !teams.length) {
    //data.value.players = [];
    return;
  }

  if(data.value){
    try {
      data.value.players = await $fetch<Partial<IPlayer>[]>('/api/admin/posts/load_players',
          {params: {teams: JSON.stringify(teams.map(team => team?.slug))}});
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
    }
  }

  postToUpdate.value.teamsDb = postToUpdate.value.teams?.map(team => team.id) as number[];
}

function playerChanged(players: Partial<IPost['players']>) {
  postToUpdate.value.playersDb = players.map(player => player?.id) as number[];
}

function tagChanged(tags: Partial<IPost['tags']>) {
  const tagsLowSlug = tags.map(tag =>
      ({...tag, slug: slugify(tag?.name || '', {strict: true, lower: true})})
  );
  const filteredTags = removeDuplicates(tagsLowSlug, 'slug');

  postToUpdate.value.tagsDb = filteredTags.filter(t => t?.id).map(tag => tag?.id) as number[];
  postToUpdate.value.newTags = [...filteredTags.filter(t => !t?.id)]
}

function ecupChanged(ecup: string) {
  if (!ecup) {
    postToUpdate.value.ecup = {slug: ''};
    postToUpdate.value.ecup_id = null;
    return
  }
  postToUpdate.value.ecup = {...data.value?.ecups[data.value.ecups.findIndex(ec => ec.slug === ecup)]} as IPost['ecup'];
  postToUpdate.value.ecup_id = postToUpdate.value.ecup?.id;
}

function closeModal(): void {
  postToUpdate.value = {status: false, title: ''}
  picToLoad.value = '';
  showDlg.value = false;
  mode.value = null;
  selectedFile.value = undefined;
}

async function updateItem(post: IPost): Promise<void> {
  mode.value = 'edit';
  postToUpdate.value = JSON.parse(JSON.stringify(post));
  if (!postToUpdate.value.champ) {
    postToUpdate.value.champ = {slug: ''};
  }
  if (!postToUpdate.value.ecup) {
    postToUpdate.value.ecup = {slug: ''};
  }
  postToUpdate.value.teams = [...post.teams.map(team => team.team || team)];
  postToUpdate.value.players = [...post.players.map(player => player.player || player)];
  postToUpdate.value.tags = [...post.tags.map(tag => tag.tag || tag)];

  postToUpdate.value.playersDb = postToUpdate.value.players.map(player => player.id) as number[];
  postToUpdate.value.tagsDb = postToUpdate.value.tags.map(tag => tag.id) as number[];

  if (Array.isArray(postToUpdate.value.teams) && postToUpdate.value.teams.length) {
    await teamChanged(postToUpdate.value.teams)
  }
  showDlg.value = true;
}

function updatedContent(cont: string): void {
  postToUpdate.value.body = cont;
}

function addItem(): void {
  mode.value = 'add';
  postToUpdate.value = {status: false, is_headline: false,  title: '',
    champ: {slug: ''}, ecup: {slug: ''}, players: [], teams: [], tags: []
  }
  showDlg.value = true;
}

function handleFileChange(event: { target: { files: (File | undefined)[]; }; }) {

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

async function storeItem(): Promise<void> {

  try {

    showLoading.value = true;

    const postToDb = {
      id: postToUpdate.value.id,
      title: postToUpdate.value.title,
      subtitle: postToUpdate.value.subtitle,
      body: postToUpdate.value.body,
      ecup_id: postToUpdate.value.ecup_id,
      champ_id: postToUpdate.value.champ_id,
      img: postToUpdate.value.img,
      players: postToUpdate.value.playersDb || [],
      tags: postToUpdate.value.tagsDb || [],
      newTags: postToUpdate.value.newTags || [],
      teams: postToUpdate.value.teamsDb || [],
      slug: postToUpdate.value.slug || slugify(postToUpdate.value?.title as string  || '', {strict: true, lower:true}),
      source: postToUpdate.value.source,
      date: postToUpdate.value.date || +Date.now(),
      status: postToUpdate.value.status,
      is_headline: postToUpdate.value.is_headline,
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(postToDb))

    if (selectedFile.value) {
      formData.append('media_file', selectedFile.value as File)
    }

    showTable.value = false;

    if (mode.value === 'edit') {
      const {result} = await $fetch<{ result: IPost }>('/api/admin/posts/edit', {
        method: 'PUT',
        body: formData,
      })
      const ind: number = data.value?.posts.findIndex((post: Partial<IPost>) => post.id === postToUpdate.value.id) as number;

      if(data.value){
        data.value.posts[ind] = {...postToUpdate.value, img: result.img};
      }
    } else if (mode.value === 'add') {
      const res = await $fetch<{ result: IPost, postToAdd:Partial<IPost> }>('/api/admin/posts/add', {
        method: 'POST',
        body: formData,
      })
      if(data.value){
        data.value.posts.unshift({...postToUpdate.value, img: res.result.img, id: res.result.id});
      }

      if(res.postToAdd){
        socket.value?.emit( 'post-added',
            {...res.postToAdd}
        );
       // useNuxtApp().$socket.emit("post-added", {...res.postToAdd});
      }
    }

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
    showTable.value = true;
  }
}

async function removeItem(dbId: number, path: {original: string, thumbnail:string}): Promise<void> {

  if (confirm('Are you sure?')) {
    try {
      showLoading.value = true;
      //useNuxtApp().$toast.info('Processing...');

      const {id} = await $fetch<{ id: number }>('/api/admin/posts/remove', {
        method: 'DELETE',
        body: {id: dbId, path},
      })

      showTable.value = false;

      if(data.value){
        data.value.posts.splice(data.value.posts.findIndex((item) => item.id === +id), 1);
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
      showTable.value = true;
    }
  }
}

function imageUrlAlt(event: Event): void {
  (event.target as HTMLImageElement).src = "/no_player.png";
}

onMounted(() => {
  socket.value = io({
    path: '/api/socket.io'
  })

});

onBeforeUnmount(() => {
  socket.value?.disconnect();
})

</script>

<style>

</style>-->
