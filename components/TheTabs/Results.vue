<template>
  <table class="w100 table-info">
    <template v-if="fullCalendar" v-for="(dates, tour) in results">
      <thead>
      <tr>
        <th colspan="6" class="center pt-1 pb-1 bg-black white">{{tour}}-й тур. </th>
      </tr>
      </thead>
      <template v-for="(results, date) in sortObj(dates)">
        <thead>
        <tr>
          <th colspan="6" class="center pt-1 pb-1">{{$resultDate(+date)}}</th>
        </tr>
        </thead>
        <TheTabsResultItem :results="results"/>
      </template>
    </template>
    <template v-else v-for="(results, date) in sortObj(tour.scores)">
    <thead>
    <tr>
      <th colspan="6" class="center pt-1 pb-1">{{tour.num}}-й тур. {{$resultDate(+date)}}</th>
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