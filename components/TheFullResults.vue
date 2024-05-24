<template>
    <template v-for="(dates, tour) in info">
    <thead>
    <tr>
        <th colspan="6" class="text-center py-3 bg-zinc-800 text-zinc-100">
          {{ parseInt(tour) !== 99 ? tour+'-й тур.' : 'Переходный матч'  }}
        </th>
    </tr>
    </thead>
    <template v-for="(results, date, i) in sortObj(dates)">
        <thead>
        <tr>
            <th colspan="6" class="text-center py-3 bg-zinc-100 border-b border-solid border-zinc-800 border-opacity-5">{{ $resultDate(+date) }}</th>
        </tr>
        </thead>
        <tbody>
        <TheShortResults  :iter="i" :results="results"/>
        </tbody>

    </template>
    </template>
</template>

<script setup lang="ts">
const {$resultDate} = useNuxtApp();
import sortObj from "~/helpers/sortObj";

const props = defineProps({
    info: Object,
})

</script>

<style scoped>

</style>