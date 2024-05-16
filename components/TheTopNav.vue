<template>
  <nav class="relative flex w-full items-center justify-between bg-zinc-800 text-neutral-50 h-[60px] py-1 px-3">
    <slot>
      <div class="lg:hidden cursor-pointer" @click="$emit('toggleSideB')">
        <Icon name="ic:sharp-menu" class size="30px"/>
      </div>

      <div class="sm:text-3xl font-bold text-base flex-grow text-center lg:text-left lg:flex-grow-0">
        <nuxt-link :active-class="'none'" :exact-active-class="'none'" to="/">
          НОВОСТИ ЕВРОФУТБОЛА
        </nuxt-link>
      </div>
      <div class="h-full p-0 m-0 w-[300px] relative group hidden lg:block">
        <TheSearchInput/>
      </div>
      <TheUserPanel/>
    </slot>
  </nav>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>