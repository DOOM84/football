<template>
  <div>
    <h3>{{ showMode }}</h3>
    <div class="mt-1">

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
          <button class="loginBtn" :disabled="showIcon" @click="authorize">
            <i v-if="showIcon" class="fas fa-sync fa-spin"></i>
            <span v-else>{{ showMode }}</span>
          </button>
          <button class="loginBtn" @click="toggleMode(null)">{{ showBtnMode }}</button>
          <button class="loginBtn" @click="toggleMode('reset')">Забыл пароль</button>
        </div>
      </template>

      <template v-else>
        <input @keyup.enter="authorize" class="contact" v-model.trim="email" type="email"
               name="email" placeholder="Email">
        <div class="mt-1">
          <button class="loginBtn" :disabled="showIcon" @click="authorize">
            <i v-if="showIcon" class="fas fa-sync fa-spin"></i>
            <span v-else>Отправить</span>
          </button>
          <button class="loginBtn" @click="toggleMode('login')">Войти</button>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
const {$showToast, $logOut} = useNuxtApp();

const authToken = useTokenAuth();
const isLoggedIn = useIsloggedIn();
const user = useUserInfo();

const login = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const mode = ref('login');
const err = ref(false);
const showIcon = ref(false);
const showModal = useAuth();

const showMode = computed(() =>
    mode.value === 'signup' ? 'Регистрация' : mode.value === 'login' ? 'Вход' : 'Восстановление пароля');

const showBtnMode = computed(() => mode.value === 'signup' ? 'Вход' : 'Регистрация');

function setCookies(name, data) {
  let now = new Date();
  now.setTime(now.getTime() + 1 * 3600 * 1000);
  let expires = "expires=" + now.toUTCString();
  document.cookie = name + "=" + data + ";" + expires + ";path=/; SameSite=Lax;";
}

function toggleMode(reset = null) {
  if (reset) {
    mode.value = reset
  } else {
    mode.value = mode.value === 'login' ? 'signup' : 'login'
  }
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async function authorize() {

  if (isLoggedIn.value) {
    return
  }
  err.value = false;

  if (!validateEmail(email.value)) {
    err.value = true;
    $showToast('Введен некорректный Email адрес', 'error');
  }

  if (mode.value !== 'reset') {
    if (password.value.length < 6) {
      err.value = true;
      $showToast('Пароль не должен быть менее 6 символов', 'error');
    }
  }

  if (mode.value === 'signup') {
    let strippedLogin = login.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/gi, '')


    if (!strippedLogin || strippedLogin !== login.value || strippedLogin.length < 3) {
      err.value = true;
      $showToast('Некорректное имя пользователя. Специальные символы в имени пользователя запрещены, либо длина менее 3 символов', 'error');
    }

    if (password.value !== passwordConfirmation.value) {
      err.value = true;
      $showToast('Введенные пароли не совпадают.', 'error');
    }
  }

  if (err.value) {
    return
  }

  const info = {email: email.value}

  if (mode.value !== 'reset') {
    //formData.append("password", password.value);
    info.password = password.value
  }

  if (mode.value === 'signup') {
    info.login = login.value;
    info.passwordConfirmation = passwordConfirmation.value;
  }

  try {
    showIcon.value = true
    const data = mode.value === 'signup' ? await $fetch('/api/auth/signup', {
      method: 'POST',
      body: info,
    }) : mode.value === 'login' ?
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: info,
        }) : await $fetch('/api/auth/reset', {
          method: 'POST',
          body: info,
        })

    if (mode.value !== 'reset') {
      setCookies('token', data.token);
      authToken.value = data.token;
      isLoggedIn.value = !!data.token;

      user.value = {
        name: data.login,
        avatar: data.avatar,
        //id: data.id
      }

      showModal.value = false;

    } else {
      showIcon.value = false;
      $showToast('Данные успешно отправлены на Ваш Email', 'success');
      mode.value = 'login';
    }
  } catch (error) {
    showIcon.value = false;
    err.value = true;
    $logOut();

    if (mode.value === 'signup') {

      if (error.response.status !== 422) {

        $showToast('Такой Email адрес уже существует', 'error');

      } else {

        $showToast(error.response.data.msg, 'error');
      }
    } else {

      if (error.response.status !== 422) {

        $showToast('Пользователя с такими данными не существует', 'error');

      } else {

        $showToast(error.response.data.msg, 'error');
      }

    }
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

</style>