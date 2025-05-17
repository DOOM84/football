<template>
<div>
  <ul>
    <li v-for="card in grouppedCards"
        class="flex gap-3 justify-end items-center"
        :class="reverse ? 'flex-row-reverse' : ''"
    >
      <div class="flex flex-wrap">
        <ThePlayerLink :slug="card.player.slug" :name="card.player.name"/>
      </div>
      <div>
        <span>{{ card.time.elapsed }}'</span>
        <small v-if="card.time.extra">(+{{ card.time.extra }}')</small>
      </div>
      <Icon name="tabler:rectangle-vertical-filled" class="min-w-[20px]"
            :class="card.detail.toLowerCase() === 'yellow card' ? 'text-yellow-400' : 'text-red-500'"
            size="20"/>
    </li>
  </ul>
</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  grouppedCards: Record<string, any>[];
  reverse?: boolean;
}>()
</script>

<style scoped>

</style>