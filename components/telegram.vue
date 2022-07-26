<template>
  <div :id="tid">
  </div>
</template>

<script setup>
const {$scribe} = useNuxtApp();

const props = defineProps({
  tid: {type: String, default: 'telega'},
  path: {type: String, default: ''},
})

const tg = ref(null);

onMounted(() => {
  setTimeout(() => {
    $scribe('#' + props.tid, `<script async src="https://telegram.org/js/telegram-widget.js?19"
data-telegram-post="${props.path}" data-width="100%"><\/script>`)
  }, 1000);
})


</script>