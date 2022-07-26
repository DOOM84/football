<template>
  <div v-if="error" class="center">
    <i class="fas fa-circle-notch fa-spin fa-3x grey"></i>
  </div>
  <div v-else>
    <div class="center w100">
      <img class="w100" :src="data.post.images.original" alt="">
    </div>
    <div class="d-flex pl-1 pr-1 s-between addInfo">
      <div v-if="data.post.source">Источник: <span>{{ data.post.source }}</span></div>
      <div>{{ $singlePostDate(data.post.date) }}</div>
    </div>

    <TheRating class="right mr-1 rating" :userRate="data.post.userRate"
               @rateChanged="rateChanged"/>

    <div class="pl-1 pr-1 mb-1">
      <h2 class="postTitle">
        {{ data.post.title }}
      </h2>
      <div class="postSubTitle">
        {{ data.post.subtitle }}
      </div>

      <div ref="loadedPost" v-if="data.post" v-html="data.post.body" class="body-text">
      </div>

      <div ref="loadedTweets">
        <tweet :key="tweet" v-for="tweet in tweets" :tweet-id="tweet"/>
      </div>

      <div ref="loadedTgs">
        <telegram :key="tgPost" v-for="tgPost in tgPosts" :tid="tgPost.split('/')[1]" :path="tgPost"/>
      </div>

      <div class="mt-2 d-flex items-center tagsInfo">
        <span v-if="data.post.tags || data.post.players || data.post.teams">Теги:</span>
        <nuxt-link class="noScroll" v-if="data.post.tags && data.post.tags.length"
                   v-for="tag in data.post.tags" :to="'/tag/'+tag.slug">
          <div class="tag">
            {{ tag.name }}
          </div>
        </nuxt-link>
        <nuxt-link class="noScroll" v-if="data.post.players && data.post.players.length"
                   v-for="player in data.post.players" :to="'/player/'+player.slug">
          <div class="tag">
            {{ player.name }}
          </div>
        </nuxt-link>
        <nuxt-link class="noScroll" v-if="teams && teams.length"
                   v-for="team in teams" :to="'/team/'+team.slug">
          <div class="tag">
            {{ team.name }}
          </div>
        </nuxt-link>

      </div>


      <CommentsCWrap @comDeleted="comDeleted" @comAdded="comAdded"
                     :slug="data.post.slug"
                     :commentsCount="comCount"
                     :comments="data.comments"
      />
    </div>

  </div>
</template>

<script setup>
import {onMounted} from "vue";

const {$showToast, $logOut, $singlePostDate, $socket} = useNuxtApp();

const loadedPost = ref(null);

const tweets = ref([]);

const tgPosts = ref([]);

const loadedTweets = ref(null);

const loadedTgs = ref(null);

const initInfo = useInitInfo();

const route = useRoute();

const {data, error, pending} = await useAsyncData('post', () => $fetch('/api/post',
    {params: {slug: route.params.post}}), {initialCache: false})

if (error?.value) {
  throwError(error.value)
}

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - ' + data.value.post.title ;
  }
})


const comCount = computed(() => data.value.comments.length || 0);

function comAdded(comment) {
  data.value.comments.push(comment);
  $showToast('Ваш комментарий успешно добавлен', 'success');
}

function comDeleted(toDel) {
  data.value.comments.splice(data.value.comments.findIndex(item => item.id === toDel), 1);
  $showToast('Комментарий успешно удален', 'success');
}

function rateChanged(rate) {
  data.value.post.userRate = rate;
}

const teams = computed(() => {

  if (!data.value.post.teams || !data.value.post.teams.length) {
    return null
  }

  const postTeams = [];

  data.value.post.teams.map((team) => {

    for (let i = 0; i < initInfo.value.stands.length; i++) {

      const ind = initInfo.value.stands[i].teams.findIndex((tm) => {
        return tm.slug === team
      })

      if (ind > -1) {
        postTeams.push({
          name: initInfo.value.stands[i].teams[ind].name,
          slug: initInfo.value.stands[i].teams[ind].slug
        });
        break
      }
    }

  })

  return postTeams;
})

onMounted(() => {
  showExternal();

  $socket.on("add-comment", (comment) => {

    if(comment.post === route.params.post){

      data.value.comments.push(comment);

    }

  });

})


onBeforeUnmount(() => {
  $socket.removeAllListeners();
})


function showExternal() {

  const elems = loadedPost.value.getElementsByClassName('tweet');

  if (elems.length) {
    for (let i = 0; i < elems.length; i++) {

      elems[i].innerHTML = '';

      tweets.value.push(elems[i].id);

    }

    nextTick(() => {

      for (let i = 0; i < loadedTweets.value.children.length; i++) {

        elems[i].appendChild(loadedTweets.value.children[i]);

      }

    })

  }


  const tgs = loadedPost.value.getElementsByClassName('tgram');


  if (tgs.length) {
    for (let i = 0; i < tgs.length; i++) {

      tgs[i].innerHTML = '';

      const dataPath = tgs[i].getAttribute('data-path');

      tgPosts.value.push(dataPath);

    }

    tgs[0].appendChild(loadedTgs.value);

  }
}
</script>

<style lang="scss" scoped>

.addInfo {
  font-size: .75rem;
  color: #666;

  span {
    color: #f44336;
  }
}

.rating {
  margin-top: 0.5rem;
}

.postTitle {
  padding-bottom: 0;
  margin-bottom: 0.5rem
}

.postSubTitle {
  color: #5c5c5c;
}

.tagsInfo {
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  .tag {
    color: #000000;
    background: #e0e0e0;
    border-radius: 16px;
    font-size: 14px;
    height: 32px;
    padding: 5px 10px;

    &:hover {
      background: #d1d0d0;
    }
  }
}

</style>