<template>
  <div>
    <div v-for="post in posts" class="post  mt-1 pl-1 pr-1 ">
      <ThePostsItem :post="post"/>
    </div>
    <div v-if="showMore" class="right">
      <nuxt-link to="/news">
        Все новости
      </nuxt-link>
    </div>
  </div>

</template>

<script setup>
const {$socket} = useNuxtApp();
const route = useRoute();
const emit = defineEmits(['newPost'])

const props = defineProps({
  posts: {type: Array, default: []},
  showMore: {type: Boolean, default: false}
})

onBeforeUnmount(() => {
  $socket.removeAllListeners();
})

onMounted(() => {

  $socket.on("add-post", (data) => {

    if (route.params.champ && route.params.champ === data.champ) {
      emit('newPost', data);
    } else if (route.params.ecup && route.params.ecup === data.ecup) {
      emit('newPost', data);
    } else if (route.path === '/') {
      emit('newPost', data);
    }

  });

})

</script>

<style scoped lang="scss">

.post {
  border-bottom: 1px solid rgba(0, 0, 0, .1)
}

</style>