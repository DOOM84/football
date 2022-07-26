<template>
  <div class="d-flex items-center g-1" :class="side ? 'white flexColumn' : 'h100 auth-box'">
    <button v-if="!isLoggedIn" @click="showModal = true" class="header-btn"
            :class="side ? '' : 'h100'">
      <i class="fa-solid fa-arrow-right-to-bracket"></i>
      Вход
    </button>
    <template v-else>
          <span class="userName noScroll">
            {{ user.name }}
          </span>
      <img @click.self="avaUpload = !avaUpload"
           class="pointer rounded userAvatar"
           :src="user.avatar.substring(user.avatar.indexOf('/img'))" alt="">

      <TheAvatarUpload :oldAva="user.avatar" v-if="avaUpload"/>

      <button @click="logOut" class="header-btn" :class="side ? '' : 'h100'">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
        Выход
      </button>
    </template>

  </div>
</template>

<script setup>

const {$logOut} = useNuxtApp();

const isLoggedIn = useIsloggedIn();

const showModal = useAuth();

const user = useUserInfo();

const avaUpload = ref(false);

const props = defineProps({
  side: {type: Boolean, default: false},
})

function logOut() {
  $logOut();
}
</script>

<style lang="scss" scoped>

.userName {
  font-weight: 600;
  font-size: 1rem;
}

.userAvatar {
  width: 50px;
  height: 50px
}

.header-btn {

  font-weight: 600;
  font-size: .875rem;
  position: relative;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-out;
  background: transparent;
  color: #fff;
  padding-left: 10px;
  padding-right: 10px;
  text-transform: uppercase;
  margin-right: 20px;

  &:hover {
    background: rgba(142, 142, 142, 0.2);
  }

  i {
    padding-right: 10px;
  }
}
</style>