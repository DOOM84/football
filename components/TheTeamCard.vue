<template>
  <nuxt-link :to="'/team/' + team.slug">
    <div class="row-item pl-1 pr-1 pt-1" :style="{maxWidth: mWidth+'px'}">
      <img class="teamImg" :src="team.img" alt="">
      <div class="pl-1 pb-1 pr-1 right">
        <div class="mt-1 center post-name teamName">{{ team.name }}</div>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup>

const props = defineProps({
  team: {type: Object, default: {}},
  mWidth: {type: Number, default: 250},
})
</script>

<style scoped lang="scss">

.teamImg {
  max-width: 151px;
}

.teamName {
  font-size: 1.5rem;
}

</style>