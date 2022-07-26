<template>
  <div>
    <ClientOnly>
      <star-rating :increment="0.1"
                   v-model:rating="userRate"
                   @update:rating="setRating"
                   :show-rating="false"
                   :star-size="20"
                   :glow="5"
                   :read-only="!isLoggedIn"
                   glow-color="#ffd055"
      />
    </ClientOnly>
  </div>
</template>

<script setup>
const route = useRoute();
const {$showToast, $logOut} = useNuxtApp();
const isLoggedIn = useIsloggedIn();
const showModal = useAuth();

const emit = defineEmits(['rateChanged'])

const props = defineProps({
  userRate: {type: Number, default: 0},
})

async function setRating(rating) {
  if (!isLoggedIn.value) {
    showModal.value = true;
    return;
  }

  try {

    const {rate} = await $fetch('/api/auth/rate', {
      method: 'POST',
      body: {id: route.params.post, rating: rating},
    })

    emit('rateChanged', rate)

  } catch (e) {
    if (e.response.status === 401) {
      showModal.value = true;
      $logOut();
    }

    if (e.response.status === 403) {
      showModal.value = true;
      $logOut();

    }
  }
}

</script>