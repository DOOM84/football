<template>
  <input @keyup.enter="search" v-model.trim="searchTerm" type="text" class=" h-full w-full bg-zinc-600 outline-0 placeholder-zinc-300 pl-7
            focus:placeholder-zinc-800
            focus:text-zinc-800
            duration-300 focus:bg-zinc-200" placeholder="Поиск">
  <Icon :name="icon" size="20px" class="text-zinc-300 group-focus-within:text-blue-600
            absolute top-[30%] left-[2px]"/>

</template>

<script setup lang="ts">

import type {IPlayer, ISmallPost, ITeam} from "~/types/interfaces";

const searchTerm = ref<string>('');

const route = useRoute();

const router = useRouter();

const searchResult = useResult();

const term = useTerm();

const searchLoad = useSearchLoad();

const setSide: any = inject('setSide');

const icon = computed(()=>{
 return  searchLoad.value ? 'svg-spinners:12-dots-scale-rotate' : 'material-symbols:search'
})

async function search(): Promise<void> {

  if (route.path === '/search') {
    setSide(false);
  }

  searchTerm.value = searchTerm.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/gi, '');

  searchTerm.value = searchTerm.value.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");

  if ((!searchTerm.value || searchTerm.value.length < 3) || term.value === searchTerm.value) {
    return
  }

  searchLoad.value = true;

  searchResult.value = {
    posts: {results: [], count: 0},
    players: {results: [], count: 0},
    teams: {results: [], count: 0},
  };

  term.value = searchTerm.value;

  searchResult.value = await $fetch<{
    posts: { results: Partial<ISmallPost>[], count: number },
    players: { results: Partial<IPlayer>[], count: number },
    teams: { results: Partial<ITeam>[], count: number },
  }>
  ('/api/search', {
    params:
        {
          term: searchTerm.value,
          postsLimit: 28,
          playersLimit: 28,
          teamsLimit: 28,
        }
  });

  searchLoad.value = false;

  if (route.path !== '/search') {
  await router.push('/search');
  }

}


</script>

<style scoped>

</style>