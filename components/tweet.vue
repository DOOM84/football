<template>
  <div class="d-flex justify-center" :id="tweetId" ref="box"></div>
</template>

<script setup>

const props = defineProps({
  oembedHtml: {type: String, default: null},
  tweetId: {type: String, default: null},
})

const box = ref(null);

onMounted(() => {
  if (props.tweetId)
    twttr.widgets.createTweet(props.tweetId, box.value)
  else
    twttr.widgets.load(box.value)
})

</script>

<style>
.r-y54riw {
  min-width: 150px !important;
}

</style>