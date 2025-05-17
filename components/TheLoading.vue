<template>
  <div>
    <loading :active="showLoad"
             :can-cancel="true"
             loader="dots"
             :is-full-page="fullPage"></loading>
  </div>

</template>

<script setup>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const props = defineProps({
  showLoad: {type: Boolean, default: true},
  fullPage: {type: Boolean, default: true}
})
</script>