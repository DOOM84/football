<template>
  <table class="w100 table-info">
    <slot></slot>
    <template v-for="(info, tourNum) in tour">
      <template v-for="(results, date) in sortObj(info)">
        <thead>
        <tr>
          <th colspan="6" class="center pt-1 pb-1">{{ tourNum }}-й тур, {{ $resultDate(+date) }}</th>
        </tr>
        </thead>
        <TheTabsResultItem :results="results"/>
      </template>
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