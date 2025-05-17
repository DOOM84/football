<template>
  <div class="comment-wrapper">
    <div class="comment-container">
      <div class="comment-section">
        <div class="comment-info">
          <img class="author-avatar" :src="comment.user?.avatar || '/no_avatar.png'">
          <div class="author-info">
            <span class="author-name"><strong>{{ comment.user.login }}</strong></span>
            <span>{{ $showDateHuman(+comment.stamp) }}</span>
            <div class="flex gap-1 flex-wrap items-center">
              <span @click="quote" class="quote-author cursor-pointer">Ответить</span>
                <ClientOnly>
                  <Icon @click="sendLike(comment.id, 1)" name="clarity:thumbs-up-line" class="duration-300 cursor-pointer hover:text-green-500" size="20px"/>
                  <span>{{comment._count.userLikes}}</span>
                  <Icon @click="sendLike(comment.id, -1)" name="clarity:thumbs-down-line" class="duration-300 cursor-pointer hover:text-rose-500" size="20px"/>
                  <Icon v-if="user?.app_metadata?.admin" @click="removeComment(comment.id)" name="material-symbols:delete" class="cursor-pointer" size="20px"/>
                </ClientOnly>
            </div>
          </div>
        </div>
        <div v-if="comment.quote" class="quote-container">
          <blockquote class="quote-text">
            <div class="quote-left">
              <i class="fas fa-quote-left"></i>
            </div>
            <div class="quote-right">
              <i class="fas fa-quote-right"></i>
            </div>
            <em>{{ comment.quote.user.login }} ({{ $showDate(comment.quote.stamp) }}): </em>
            <p>"{{ comment.quote.body }}"</p>
          </blockquote>
        </div>
        <div class="comment-text">{{ comment.body }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {IComment, IError} from "~/types/interfaces";
const {$toast, $showDateHuman, $showDate} = useNuxtApp();

const user = useSupabaseUser();
const {auth} = useSupabaseClient();

const props = defineProps<{
  comment: IComment
}>()

const emit = defineEmits(['quoting', 'delCom'])

const setLike: any = inject('setLike');

function quote(): void {
  emit('quoting', props.comment)
}

function removeComment(id: number): void {
  if (confirm('Are you sure?')) {
    emit('delCom', id)
  }
}

async function sendLike(comId:number, like: number): Promise<void> {
  try {

    const {data, error} = await auth.getSession();

    if(error){throw error}

    if (!user.value || !data?.session) {
      $toast.error('Ошибка! Вы не авторизованы');
      return
    }

    $toast.info('Отправка...');

    await $fetch<{like: number}>('/api/auth/comlike', {
      method: 'POST',
      body: {comId, like, userId: user.value.id},
    })

    setLike(+like, comId);

    useNuxtApp().$toast.success('Благодарим. Ваш голос учтен.');

  } catch (e) {

    const typedError = e as IError;

    if(typedError.response?._data?.message){

      useNuxtApp().$toast.error(typedError.response._data.message);

    }
    else{
      useNuxtApp().$toast.error(typedError.message);
    }
  }
}

</script>

<style lang="scss" scoped>
.comment-wrapper {
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.comment-container {
  width: 100%;
}

.comment-section {
  display: flex;
  flex-direction: column;
}

.comment-info {
  display: flex;
  flex-direction: row;
}

.author-avatar {
  border-radius: 50%;
  width: 80px;
  height: 80px;
}

.author-info {
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 1rem;
}

.author-name {
  display: block;
}

.quote-author {
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
}

.quote-container {
  margin-top: 1rem;
}

.quote-text {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.quote-left {
  position: absolute;
  top: 0;
  left: 5px;

  i {
    color: #fad402;
  }
}

.quote-right {
  i {
    color: #fad402;
  }

  position: absolute;
  bottom: 0;
  right: 5px;
}

.comment-text {
  margin-top: 1rem;
  text-align: left;
  white-space: break-spaces;
}

blockquote {
  border-left: 5px solid #fce27c;
  margin: 0;
  padding: 15px;
  position: relative;
  background-color: #f6ebc1;
  border-radius: 5px;
  color: black;

  p {
    margin: 0;
    text-align: left;
  }
}

</style>