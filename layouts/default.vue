<template>
    <div class="relative p-0">

        <transition name="overlay">
            <div @click="toggleSideBar(false)" ref="overlay" v-if="showSidebar" id="overlay"
                 class="fixed left-0 w-full h-full bg-zinc-800/50 z-30">
            </div>
        </transition>

        <transition name="slide">
            <TheSidebar v-if="showSidebar" :chs="cups.champs" :ecups="cups.ecups" @closeSidebar="toggleSideBar(false)" />
        </transition>

        <header>
            <TheTopNav   @toggleSideB="toggleSideBar(false, true)"/>
            <TheMainNav :chs="cups.champs" :ecups="cups.ecups" />
        </header>
        <div class="max-w-[1200px] m-auto bg-white lg:min-h-[calc(100vh-180px)] min-h-[calc(100vh-120px)]">
            <slot />
        </div>
        <TheFooter/>
    </div>
</template>


<script lang="ts" setup>
const route = useRoute();

const showSidebar = ref(false)
const cups = useCups();

provide('setSide', (flag: boolean)=>{
  toggleSideBar(flag)
})

provide('season', '');

useHead({
  title: 'Новости европейского футбола',
})

const bodyBg = computed(() => route.params.ecup === 'lch'
|| route.params.ecup === 'le' || route.params.ecup === 'lconf' ? route.params.ecup + '_bg' : 'bg')

useHead({
    bodyAttrs: {
        id: bodyBg
    }
})

watch(
    () => route.fullPath,
    () => {
      toggleSideBar(false);
      useNuxtApp().$scrollTo('body', 500, {offset: -100});
    },
);

function toggleSideBar(flag: boolean, toggle?: boolean): void {
    if (toggle) {
        showSidebar.value = !showSidebar.value
    } else {
        showSidebar.value = flag;
    }
    if(!showSidebar.value){
        document.body.classList.remove('overflow-hidden');
    }else{
        document.body.classList.add('overflow-hidden');
    }

}
</script>

<style scoped lang="scss">

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  //opacity: 0;
  transform: translateX(-250px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.5s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>