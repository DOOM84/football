<template>
  <div>
    <ClientOnly>
      <Teleport to="body">
        <TheModal :show="true" :max-w="'400'" :showLoading="showLoading">
          <template #body>
            <input @keyup.enter="authorize" class="contact" v-model.trim="password" type="password"
                   name="password" placeholder="Пароль">

            <input @keyup.enter="authorize" class="contact" v-model.trim="passwordConfirmation" type="password"
                   name="passwordConfirmation"
                   placeholder="Пароль еще раз">

            <div class="mt-1">
              <button class="loginBtn" :disabled="disabled" @click="authorize">
                <span>Отправить</span>
              </button>
            </div>
          </template>
        </TheModal>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type {IError} from "~/types/interfaces";
const { auth } = useSupabaseClient();
const disabled = ref<boolean>(false);
const showLoading = ref<boolean>(false);
const route = useRoute();
const router = useRouter();
const password = ref('');
const passwordConfirmation = ref('');

definePageMeta({
  middleware: [
    function (to, from) {
      if(!to.query.code) {
        return navigateTo('/')
      }
    },
  ],
});

useHead({
  titleTemplate: '%s - Восстановление пароля'
})

const error = useError();
async function authorize(): Promise<void> {

  try {

    if (password.value.length < 6) {
      useNuxtApp().$toast.error('Пароль не должен быть менее 6 символов');
      return
    }

    if (password.value !== passwordConfirmation.value) {
      useNuxtApp().$toast.error('Введенные пароли не совпадают.');
      return
    }

    showLoading.value = true;


    const {result} = await $fetch<{ result: boolean }>('/api/auth/restore', {
      method: 'POST',
      body: {password: password.value, passwordConfirmation: passwordConfirmation.value},
    })

    if (!result) {
      showLoading.value = false;
      return
    }

    const { data, error } = await auth.updateUser({
      password: password.value
    })

    if (error) {
      throw error
    }

    useNuxtApp().$toast.success('Ваш пароль был успешно обновлен')

    disabled.value = true;

    useNuxtApp().$toast.info('Вы будете перенаправлены на главную страницу через 5 секунд');

    setTimeout(() => {
      router.replace({ hash: '', query: {}, path: '/' })
    }, 5000);

  }catch (error) {

    showLoading.value = false;

    const typedError = error as IError;

    if(typedError.response?._data?.message){
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    }else{
      useNuxtApp().$toast.error(typedError.message)
    }

    disabled.value = true;

      useNuxtApp().$toast.info('Вы будете перенаправлены на главную страницу через 5 секунд');
      setTimeout(() => {
        router.replace({ hash: '', query: {}, path: '/' })
      }, 5000);

  }

}

onMounted(()=>{

  if(route.query?.error){
    disabled.value = true;
    useNuxtApp().$toast.error('Ссылка активации пароля недействительна');
    useNuxtApp().$toast.info('Вы будете перенаправлены на главную страницу через 5 секунд');
    setTimeout(() => {
      router.replace({ hash: '', query: {}, path: '/' })
    }, 5000);
  }

})

</script>

<style lang="scss" scoped>
.loginBtn {
  cursor: pointer;
  width: 100%;
  border: none;
  background: #327135;
  color: #FFF;
  margin: 0 0 5px;
  padding: 10px;
  font-size: 15px;
}

.contact {
  outline: none;
  transition: all 0.5s ease-out;


  width: 100%;
  border: 1px solid #ccc;
  background: #FFF;
  padding: 10px;
  margin-bottom: 10px;

  &:focus {
    background: #f8fafc;
    color: #000;

    &::placeholder {
      color: transparent;
      transition: all 0.5s ease-out;
    }
  }
}
</style>
