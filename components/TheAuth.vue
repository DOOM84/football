<template>
  <div>
    <h3 class="text-xl font-bold">{{ showMode }}</h3>
    <div class="mt-5">

      <template v-if="mode==='signup' || mode==='login'">
        <input @keyup.enter="authorize" v-if="mode==='signup'" class="contact" v-model.trim="login" type="text"
               name="login" placeholder="Логин">
        <input @keyup.enter="authorize" class="contact" v-model.trim="email" type="email"
               name="email" placeholder="Email">

        <input @keyup.enter="authorize" class="contact" v-model.trim="password" type="password"
               name="password" placeholder="Пароль">

        <template v-if="mode==='signup'">
          <input @keyup.enter="authorize" class="contact" v-model.trim="passwordConfirmation" type="password"
                 name="passwordConfirmation"
                 placeholder="Пароль еще раз">
        </template>

        <div class="mt-1">
          <button class="loginBtn" :disabled="disabled" @click="authorize">
            <span>{{ showMode }}</span>
          </button>
          <button class="loginBtn" @click="toggleMode(null)">{{ showBtnMode }}</button>
          <button class="loginBtn" @click="toggleMode('reset')">Забыл пароль</button>
        </div>
      </template>

      <template v-else>
        <input @keyup.enter="authorize" class="contact" v-model.trim="email" type="email"
               name="email" placeholder="Email">
        <div class="mt-1">
          <button class="loginBtn" :disabled="disabled" @click="authorize">
            <span>Отправить</span>
          </button>
          <button class="loginBtn" @click="toggleMode('login')">Войти</button>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>

import type {IError} from "~/types/interfaces";

const {auth} = useSupabaseClient();

const emit = defineEmits<{
  (e: 'load', notClose: boolean | undefined): void
}>()

const user = useSupabaseUser();

const login = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const passwordConfirmation = ref<string>('');
const mode = ref<string>('login');
const err = ref<boolean>(false);
const disabled = ref<boolean>(false);

const showMode = computed(() =>
    mode.value === 'signup' ? 'Регистрация' : mode.value === 'login' ? 'Вход' : 'Восстановление пароля');

const showBtnMode = computed(() => mode.value === 'signup' ? 'Вход' : 'Регистрация');

function toggleMode(reset: string | null = null): void {
  if (reset) {
    mode.value = reset
  } else {
    mode.value = mode.value === 'login' ? 'signup' : 'login'
  }
}

function validateEmail(email: string): boolean {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async function authorize(): Promise<void> {

  if (user.value) {
    emit('load', false)
    return
  }

  err.value = false;

  if (!validateEmail(email.value)) {
    err.value = true;
    useNuxtApp().$toast.error('Введен некорректный Email адрес');
  }

  if (mode.value !== 'reset') {
    if (password.value.length < 6) {
      err.value = true;
      useNuxtApp().$toast.error('Пароль не должен быть менее 6 символов');
    }
  }

  if (mode.value === 'signup') {
    let strippedLogin = login.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/gi, '')

    if (!strippedLogin || strippedLogin !== login.value || strippedLogin.length < 3) {
      err.value = true;
      useNuxtApp().$toast.error('Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов');
    }

    if (password.value !== passwordConfirmation.value) {
      err.value = true;
      useNuxtApp().$toast.error('Введенные пароли не совпадают.');
    }
  }

  if (err.value) {
    return
  }

  disabled.value = true;

  mode.value === 'login' ? await userLogin()
      : mode.value === 'signup' ? await createUser()
          : await resetUser()
}

const userLogin = async (): Promise<void> => {
  try {
    emit('load', false);

    const {result} = await $fetch<{ result: boolean }>('/api/auth/signin', {
      method: 'POST',
      body: {email: email.value, password: password.value},
    })

    if (!result) {
      return
    }

    const {error} = await auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) {
      throw error
    }

    emit('load', false)

    email.value = '';
    password.value = '';

  } catch (error) {

    emit('load', true);
    const typedError = error as IError;

    if (typedError.response?._data?.message) {
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    } else if (typedError.status === 400) {
      useNuxtApp().$toast.error('Такого пользователя не существует')
    } else {
      useNuxtApp().$toast.error(typedError.message)
    }
  } finally {
    disabled.value = false;
  }
};

const createUser = async (): Promise<void> => {
  try {
    emit('load', false);

    const {result} = await $fetch<{ result: boolean }>('/api/auth/signup', {
      method: 'POST',
      body: {
        login: login.value,
        email: email.value, password: password.value,
        passwordConfirmation: passwordConfirmation.value
      },
    })

    if (!result) {
      emit('load', false);
      return
    }

    const {error} = await auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          login: login.value
        }
      }
    });

    if (error) throw error;

    const {res} = await $fetch<{ res: boolean }>('/api/admin/createProfile', {
      method: 'POST',
      body: {
        login: login.value,
        email: email.value,
        user_id: user.value!.id
      },
    })

    emit('load', false)

    email.value = '';
    password.value = '';
    login.value = '';
    passwordConfirmation.value = '';

  } catch (error) {
    emit('load', true);
    const typedError = error as IError;
    if (typedError.response?._data?.message) {
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    } else if (typedError.status === 400) {
      useNuxtApp().$toast.error('Такой пользователь уже существует')
    } else {
      useNuxtApp().$toast.error(typedError.message)
    }
  } finally {
    disabled.value = false;
  }
};

async function resetUser(): Promise<void> {
  try {
    emit('load', false);

    if (!validateEmail(email.value)) {
      useNuxtApp().$toast.error('Введен некорректный Email адрес');
      emit('load', true);
      return
    }

    const {result} = await $fetch<{ result: boolean }>('/api/auth/reset', {
      method: 'POST',
      body: {email: email.value},
    })

    if (!result) {
      emit('load', false);
      return
    }

    const {data, error} = await auth.resetPasswordForEmail(email.value, {
      redirectTo: 'https://football.designs.network/restore',
    })

    if (error) throw error;

    emit('load', false)

    email.value = '';

    useNuxtApp().$toast.info('Инструкция по сбросу пароля отправлена на Ваш Email');

  } catch (error) {
    emit('load', true);
    const typedError = error as IError;
    if (typedError.response?._data?.message) {
      useNuxtApp().$toast.error(typedError.response?._data?.message as string);
    }else {
      useNuxtApp().$toast.error(typedError.message)
    }
  } finally {
    disabled.value = false;
  }
}

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