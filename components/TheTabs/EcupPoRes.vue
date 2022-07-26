<template>
  <table class="w100 table-info">
    <slot></slot>
    <template v-for="(results, date) in sortObj(tour.scores)">
      <thead>
      <tr>
        <th colspan="6" class="center pt-1 pb-1">{{ $resultDate(+date) }}</th>
      </tr>
      </thead>
      <TheTabsResultItem :results="results"/>
    </template>

  </table>
</template>

<script setup>
const {$resultDate} = useNuxtApp();
import sortObj from "@/helpers/sortObj";

const props = defineProps({
  tour: {type: Object, default: {}},
  results: {type: Object, default: {}},
  fullCalendar: {type: Boolean, default: false},
})

</script>

<style lang="scss" scoped>


</style>