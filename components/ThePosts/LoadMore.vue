<template>
  <div class="w100">
    <button v-if="!allLoaded && postsLength >= initialLength" :disabled="isDisabled" @click.prevent="loadPosts"
            id="showMore"
            class="pointer load-more w100">
      Загрузить еще <i v-if="showIcon" class="fas fa-circle-notch fa-spin"></i>
    </button>
    <div v-if="showRest && (allLoaded || postsLength < initialLength)" class="right">
      <nuxt-link to="/news">
        Все новости
      </nuxt-link>
    </div>
  </div>

</template>

<script setup>

const props = defineProps({
  initialLength: {type: Number, default: 15},
  postsLength: {type: Number, default: 0},
  limit: {type: Number, default: 5},
  disableWhen: {type: Number, default: 1000},
  showRest: {type: Boolean, default: true},
})

const route = useRoute();

const emit = defineEmits(['addPosts'])

const isDisabled = ref(false);
const showIcon = ref(false);
const allLoaded = ref(false);

async function loadPosts() {

  if (isDisabled.value) {
    return
  }

  isDisabled.value = true;
  showIcon.value = true;

  try {
    const postsLoaded = await $fetch('/api/load_posts',
        {
          params: {
            ecup: route.params.ecup,
            tag: route.params.tag,
            champ: route.params.champ,
            offset: props.postsLength, limit: props.limit
          }
        });

    if (postsLoaded.length) {
      emit('addPosts', postsLoaded);
      showIcon.value = false;
      isDisabled.value = postsLoaded.length < props.limit || props.postsLength >= props.disableWhen;
      allLoaded.value = isDisabled.value;

    } else {
      isDisabled.value = true;
      allLoaded.value = true;
      showIcon.value = false;
    }

  } catch (e) {
    showIcon.value = false;
  }
}

</script>

<style lang="scss" scoped>
.load-more {
  position: relative;
  height: 36px;
  min-width: 64px;
  padding: 0 16px;
  background: transparent;
  color: #1976d2;
  border: 1px #1976d2 solid;
  font-size: .875rem;
  text-transform: uppercase;
  font-weight: 600;
  transition: all .2s cubic-bezier(.4, 0, .6, 1);
  margin-top: 5px;
  margin-bottom: 5px;

  &:hover {
    background: rgba(25, 118, 210, 0.05);
  }


  &:active {
    background: rgba(25, 118, 210, 0.2);
    opacity: 1;
    transition: 0.2s
  }

}
</style>