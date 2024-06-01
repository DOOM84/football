<template>
<div>
  <ul>
    <li v-for="goal in grouppedGoals"
        class="flex gap-3 justify-end items-center"
        :class="reverse ? 'flex-row-reverse' : ''"
    >
      <div class="flex flex-wrap">
        <ThePlayerLink :slug="goal.player.slug" :name="goal.player.name"/>
        <span class="ml-1" v-if="goal.detail.toLowerCase() === 'own goal'">(аг)</span>
        <span class="ml-1" v-if="goal.detail.toLowerCase() === 'penalty'">(п)</span>
      </div>

      <div>
        <span>{{ goal.time.elapsed }}'</span>
        <small v-if="goal.time.extra">(+{{ goal.time.extra }}')</small>
      </div>
      <Icon name="ion:ios-football" class="text-gray-600 min-w-[20px]" size="20"/>
    </li>
  </ul>
</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  grouppedGoals: Record<string, any>[];
  reverse?: boolean;
}>()
</script>

<style scoped>

</style>