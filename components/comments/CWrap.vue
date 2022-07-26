<template>
  <div>
    <h2 class="sm-heading">
      Комментарии {{ commentsCount }}
    </h2>
    <div v-for="comment in comments" class="comments-container">
      <CommentsCItem @delCom="delCom" @quoting="quoting" :comment="comment"/>
    </div>

    <h2 class="sm-heading mt-1">
      Комментировать
    </h2>
    <transition name="quote">
      <div v-if="quote" class="quote">
        <p>
          <em>{{ quote.user.name }} ({{ $showDate(quote.date) }}):</em>
        </p>
        <p>
          "{{ quote.body }}"
        </p>
        <div class="quoteClose">
          <i @click="quote=null" class="fas fa-times pointer"></i>
        </div>
      </div>
    </transition>

    <textarea v-model.trim="commentBody" class="input" id="commentForm" cols="30" rows="10"
              placeholder="Комментарий"></textarea>

    <div class="right">
      <button @click="comment" class="button">Отправить</button>
    </div>
  </div>

</template>

<script setup>
import {ref} from 'vue';

const {$showToast, $logOut, $scrollTo, $socket} = useNuxtApp();

const router = useRouter();
const route = useRoute();
const showModal = useAuth();
const isLoggedIn = useIsloggedIn();

const props = defineProps({
  comments: Object,
  commentsCount: Number,
  slug: String,
});

const emit = defineEmits(['comDeleted', 'comAdded'])

const commentBody = ref('');
const quote = ref(null);

async function delCom(id) {

  try {
    $showToast('Отправка...', 'info', 2000);
    const {toDel} = await $fetch('/api/admin/comdel', {
      method: 'DELETE',
      body: {slug: props.slug, id: id},
    })
    emit('comDeleted', toDel)
  } catch (e) {

    $logOut();

    if (e.response.status === 401) {
      $showToast('Ошибка! Вы не авторизованы', 'error');
    }

    if (e.response.status === 403) {
      $showToast('Доступ запрещен', 'error');
    }

  }
}

function quoting(comment) {
  quote.value = {
    body: comment.body.substr(0, 200) + '...',
    date: comment.createdAt,
    user: {name: comment.user.name}
  }

  $scrollTo('#commentForm', 800, {offset: -100})
}

async function comment() {
  if (!isLoggedIn.value) {
    showModal.value = true;
    return;
  }


  if (!commentBody.value || commentBody.value.indexOf('\n\n\n') > 0) {
    $showToast('Введите текст, либо отформатируйте его без лишних переносов строк', 'error');
    return
  }
  if (commentBody.value.length > 8000) {
    $showToast('Содержимое Вашего комментария больше 8000 знаков', 'error');
    return
  }

  const info = {slug: route.params.post, comment: commentBody.value}

  if (quote.value) {
    info.quote = JSON.stringify(quote.value)
  }

  try {
    $showToast('Отправка...', 'info', 2000);
    const {newComment} = await $fetch('/api/auth/comment', {
      method: 'POST',
      body: info,
    })

    $socket.emit("comment-added", newComment);

    emit('comAdded', newComment)
    commentBody.value = '';
    quote.value = null;
  } catch (e) {

    if (e.response.status === 422) {

      $showToast(e.response.data.msg, 'error');

    }

    if (e.response.status === 401) {
      showModal.value = true;
      $logOut();
    }

  }
}

</script>

<style lang="scss" scoped>
.comments-container {
  width: 100%;
  margin-top: 3rem;
}

.quote {
  text-align: left;
  background: #327135;
  color: #FFFFFF;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.quoteClose {
  position: absolute;
  top: 0;
  right: 5px;
}

.quote-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.quote-enter-active {
  transition: all 1.5s;
}

.quote-leave-active {
  transition: all 1.5s;
}

.quote-enter {
  opacity: 0;
}

.quote-leave-to {
  opacity: 0;
}

.sm-heading {
  margin-bottom: 2rem;
  padding: 0.2rem 1rem;
  //background: rgba(73, 73, 73, 0.5);
}

.input {
  outline: none;
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  // background: #eece1a;
  transition: all 0.5s ease-out;

  &:focus {
    background: #fff;
    color: #000;

    &::placeholder {
      color: transparent;
      transition: all 0.5s ease-out;
    }
  }
}

textarea {
  resize: none;
}

</style>