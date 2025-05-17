<template>
  <div class="relative p-0">
    <NuxtLoadingIndicator color="white"/>
    <ClientOnly>
      <TheLoading :show-load="showLoading" />
    </ClientOnly>


    <transition name="overlay">
      <div @click="toggleSideBar(false)" ref="overlay" v-if="showSidebar" id="overlay"
           class="fixed left-0 w-full h-full bg-zinc-800/50 z-30">
      </div>
    </transition>

    <transition name="slide">
      <TheSidebar v-if="showSidebar" @closeSidebar="toggleSideBar(false)">

        <div class="flex flex-col content-center items-center my-3 gap-2 font-semibold lg:hidden mt-10 ">
          <template v-if="user">
            <div class="text-center">
              {{user?.user_metadata?.login}}
            </div>
            <div class="w-[50px] h-[50px] overflow-hidden">
              <img width="80" height="80"
                   :src="user?.user_metadata?.avatar || '/no_avatar.png'" alt="avatar">
            </div>
            <div @click="userLogout" class="cursor-pointer uppercase flex items-center gap-1">
              <Icon name="ic:twotone-log-out" size="20px"/>
              <span>Выход</span>
            </div>
          </template>
        </div>

        <div class="mt-5 py-5 pl-7 font-semibold flex flex-col">
          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin">
              Главная
            </nuxt-link>

          </div>
          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/posts">
              Новости
            </nuxt-link>

          </div>
          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/champs">
              Чемпионаты
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/leagues">
              Низшие лиги
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/cups">
              Кубки
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/ecups">
              Еврокубки
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/teams">
              Команды
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/cup_teams">
              Команды (кубки)
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/league_teams">
              Команды (низшие лиги)
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/ecup_teams">
            Команды (Еврокубки)
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/tags">
              Теги
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/remote">
              Обновление по API
            </nuxt-link>
          </div>

          <div class="pt-5">
            <nuxt-link class="hover:opacity-40 transition duration-500" to="/admin/users">
              Пользователи
            </nuxt-link>
          </div>

        </div>
        <div @click="newSeason" class="mt-5 bg-red-700 text-white p-3 cursor-pointer font-bold text-center">Закончить сезон</div>
      </TheSidebar>
    </transition>

    <header>
      <ClientOnly>
      <TheTopNav>
        <div class="cursor-pointer" @click="toggleSideBar(false, true)">
          <Icon name="ic:sharp-menu" class size="30px"/>
        </div>

        <div class="sm:text-3xl font-bold text-base flex-grow text-center lg:text-left lg:flex-grow-0">
          <nuxt-link :active-class="'none'" :exact-active-class="'none'" to="/">
            НОВОСТИ ЕВРОФУТБОЛА
          </nuxt-link>
        </div>
        <div class="gap-2 font-semibold hidden lg:flex items-center">
          <template v-if="user">
            <div>
              {{user?.user_metadata?.login}}
            </div>
            <div class="w-[50px] h-[50px] overflow-hidden">
              <img width="80" height="80"
                   :src="user?.user_metadata?.avatar || '/no_avatar.png'" alt="avatar">
            </div>
            <div @click="userLogout" class="cursor-pointer uppercase flex items-center gap-1">
              <Icon name="ic:twotone-log-out" size="20px"/>
              <span>Выход</span>
            </div>
          </template>
        </div>
      </TheTopNav>
      </ClientOnly>
    </header>
    <div class="max-w-[1200px] m-auto bg-white min-h-[calc(100vh-128px)]">
      <slot/>
    </div>
    <TheFooter/>
  </div>
</template>

<script lang="ts" setup>

const user = useSupabaseUser();

const { auth } = useSupabaseClient();

const route = useRoute();

const router =useRouter();

const showSidebar = ref<boolean>(false);

const showLoading = ref<boolean>(false);

useHead({
  title: 'Панель управления',
})

watch(
    () => route.fullPath,
    () => {
      toggleSideBar(false)
    },
);

const userLogout = async (): Promise<any> => {
  await auth.signOut();
  await router.replace('/');
};

async function newSeason(): Promise<any> {

  if (confirm('Перейти в новый сезон?')) {
  try {
    showLoading.value = true;
    const {res} = await $fetch<{ res: boolean }>('/api/admin/newSeason', {
      method: 'POST',
    })
  }catch (e) {

    console.log(e);

  }finally {
    showLoading.value = false;
  }
  }

}


function toggleSideBar(flag: boolean, toggle?: boolean): void {
  if (toggle) {
    showSidebar.value = !showSidebar.value
  } else {
    showSidebar.value = flag;
  }
  if (!showSidebar.value) {
    document.body.classList.remove('overflow-hidden');
  } else {
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