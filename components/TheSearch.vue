<template>
  <div class="search-box relative"
       :class="side ? 'mt-1 mb-1 w100': 'search-resp'">
    <i class="white fas fa-search search-icon"></i>
    <form @submit.prevent="search">
      <input v-model.trim="searchTerm"
             :style="{width: side ? '250px' : ''}"
             class="white search" placeholder="Поиск" type="text">
    </form>
  </div>
</template>

<script setup>
const props = defineProps({
  side: {type: Boolean, default: false},
})

const navToggle = useNavToggle();

const searchTerm = ref('');

const route = useRoute();

const router = useRouter();

const searchResult = useResult();

const term = useTerm();

async function search() {

  searchTerm.value = searchTerm.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/gi, '');

  searchTerm.value = searchTerm.value.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");

  if ((!searchTerm.value || searchTerm.value.length < 3) || term.value === searchTerm.value) {
    return
  }

  searchResult.value = {
    posts: {results: [], count: 0},
    players: {results: [], count: 0},
  };

  navToggle.value = false;

  term.value = searchTerm.value;

  const {posts, postsResCount, players, playersResCount} = await $fetch('/api/search', {
    params:
        {
          term: term.value,
          postsLimit: 28,
          playersLimit: 28,
        }
  });

  searchResult.value.posts.results = [...posts];
  searchResult.value.posts.count = postsResCount;
  searchResult.value.players.results = [...players];
  searchResult.value.players.count = playersResCount;

  if (route.path !== '/search') {

    router.push('/search');

  }

}

</script>


<style scoped lang="scss">
.search-box {

  .search-icon {
    position: absolute;
    top: 30%;
    left: 10px
  }

  .search {
    transition: all 0.3s ease;

    &::placeholder {
      color: rgba(227, 222, 222, 0.8);
    }

    font-size: 16px;
    padding: 0.9rem 0.9rem 0.9rem 2.2rem;
    border-radius: 5px;
    width: 300px;
    outline: none;
    background-color: rgba(142, 142, 142, 0.3);
    border-color: #272727;
  }

  &:focus-within {
    .search-icon {
      color: #2c78de;
    }

    .search {
      background: white;

      &::placeholder {
        color: rgba(142, 142, 142);
      }

      color: black;
    }
  }
}

</style>
