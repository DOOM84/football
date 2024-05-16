<template>
  <div>
    <ClientOnly>
      <star-rating :increment="0.1"
                   :rating="userRate"
                   @update:rating="setRating"
                   :show-rating="false"
                   :star-size="20"
                   :read-only="!user || readOnly"
                   glow-color="#ffd055"
      />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type {IError} from "~/types/interfaces";

const user = useSupabaseUser();
const {auth} = useSupabaseClient();

const emit = defineEmits(['rateChanged'])

const props = defineProps({
  userRate: {type: [Number, String], default: 0},
  postId: {type: Number},
})

const staticRate =ref<number>(0);
const readOnly =ref<boolean>(false);

onMounted(()=>{
  nextTick(()=>{
    staticRate.value = +props.userRate;
  })

})

async function setRating(rating: number): Promise<void> {

  try {

    const {data} = await auth.getUser();

    if(!data.user){
      const error = new Error() as IError;
      error.status = 400
      throw error;
    }

    if (!user.value || !data.user) {
      useNuxtApp().$toast.error('Вы не авторизованы');
      return
    }

    if(data.user.banned_until){
      if(Date.parse(data.user.banned_until as string) - Date.now() > 0){
        const error = new Error() as IError;
        error.status = 400
        throw error;
      }
    }

    const {rate} = await $fetch<{ rate: number }>('/api/auth/rate', {
      method: 'POST',
      body: {userId: user.value.id, postId: props.postId, rate: +rating},
    })

    emit('rateChanged', rate);
    staticRate.value = +rate;
    useNuxtApp().$toast.success('Ваша оценка учтена');

  }catch (e) {
    const typedError = e as IError;

    if(+staticRate.value === +props.userRate){
      emit('rateChanged', 0.5);
      await nextTick(()=>{
        emit('rateChanged', +staticRate.value );
      })
    }else{
      await nextTick(()=>{
        emit('rateChanged', +staticRate.value );
      })
    }

    if(typedError.status === 400){
      await auth.signOut();
      useNuxtApp().$toast.error('Вы не авторизованы');
    } else if (typedError.response?._data?.message) {
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
      readOnly.value = true;
    } else {
      useNuxtApp().$toast.error(typedError.message)
    }
  }
}

</script>