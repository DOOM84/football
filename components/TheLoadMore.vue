<template>
  <div @click="loadPosts" class="btn p-2.5 bg-blue-50 border-solid border-2 border-blue-600 cursor-pointer flex
          justify-center items-center gap-1
          text-blue-800 hover:bg-blue-100
          focus:bg-transparent focus:text-white transition my-2" :class="'my-'+props.my">
    <div v-if="loading || showLoad">
      <Icon name="svg-spinners:8-dots-rotate" size="20px" class="py-0 m-0"/>
    </div>
    <div>
      Загрузить еще
    </div>
  </div>
</template>

<script setup lang="ts">
import type {IPost} from "~/types/interfaces";


const props = withDefaults(defineProps<{count?: number; limit?: number; champId?: number; showLoad?: boolean;
  ecupId?: number; tagId?: number; playerId?: number; my?: number; search?: boolean}>(), {
  count: 0,
  limit: 0,
  my: 2,
  search: false,
  showLoad: false,
})

const emit = defineEmits<{
  (e: 'addPosts', posts: IPost[]): void,
  (e: 'addSearchResults'): void,
}>()

const loading = ref<boolean>(false)
const isDisabled = ref<boolean>(false)

async function loadPosts(): Promise<void> {

  if(props.search){
    emit('addSearchResults');
    return
  }

  if (isDisabled.value) {
    return
  }

  isDisabled.value = true;
  loading.value = true;

  try {
    const posts = await $fetch<IPost[]>('/api/loadMore',
        {
          params: {
            offset: props.count,
            limit: props.limit,
            champId: props.champId,
            ecupId: props.ecupId,
            tagId: props.tagId,
            playerId: props.playerId,
          }
        });

    isDisabled.value = false;

    if (posts.length) {
      emit('addPosts', posts as unknown as IPost[]);
      loading.value = false;
      isDisabled.value = posts.length < props.limit //|| props.count >= props.disableWhen;

    } else {
      isDisabled.value = true;
      loading.value = false;
    }

  } catch (e) {
    console.log(e);
    loading.value = false;

  }
}

</script>

<style scoped>

</style>