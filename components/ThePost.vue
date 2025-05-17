<template>
  <div class="w-full overflow-x-hidden">
    <div class="flex justify-center w-full">
      <img class="w-full" :src="post.img.original" alt="">
    </div>
    <div class="px-3">
    <div class="flex md:justify-between text-sm flex-wrap items-center justify-end gap-3">
      <div v-if="post.source">Источник: <span class="text-red-500">{{ post.source }}</span></div>
      <div>
        <TheRating :post-id="post.id" :userRate="rating"
                   @rateChanged="rateChanged"/>
      </div>
      <div>{{ $singlePostDate(+post.date) }}</div>
    </div>
    <div class="mb-1">
      <h2 class="text-2xl py-3 font-semibold">
        {{ post.title }}
      </h2>
      <div>
        {{ post.subtitle }}
      </div>

      <div ref="loadedPost" v-html="post.body"></div>

      <div>
        <div class="my-3" :id="'tg'+i" v-for="(tg, i) in tgs" :ref="el => { tgDivs[i] = el }">
          <WidgetPost width="100%" :post="tg" />
        </div>
        <div class="my-3" :id="'tweet'+i" v-for="(tweet, i) in tweets" :ref="el => { tweetDivs[i] = el }">
          <Tweet
              :tweet-id="tweet"
              align="center"
              :width="500"
              :dnt="true"
          >
            <template v-slot:loading>
              <span>Loading...</span>
            </template>

            <template v-slot:error>
              <span>Sorry, that tweet doesn’t exist!</span>
            </template>
          </Tweet>
        </div>

      </div>

      <div class="mt-5 flex items-center gap-2 flex-wrap">
        <div v-for="player in post.players"
             class="tag gap-2"
        >
          <nuxt-link class="flex items-center gap-2" :to="'/player/'+player.slug">
            <div class="p-0 m-0">
              <img class="rounded-full h-[30px] w-[30px]" :src="player.img"  alt="">
            </div>
            <div>
              {{htmlDec(player.name)}}
            </div>
          </nuxt-link>

        </div>
        <div v-for="team in post.teams"
             class="tag gap-2"
        >
          <nuxt-link class="flex items-center gap-2" :to="'/team/'+team.slug">
            <div class="p-0 m-0">
              <img :alt="team.name" class="w-[30px] h-[30px]"
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                   :style="`background: url('/teams.png') ${team.sprite};`"/>
            </div>
            <div>
              {{team.name}}
            </div>
          </nuxt-link>
        </div>
        <div v-for="tag in post.tags"
             class="tag gap-2"
        >
          <nuxt-link :to="'/tag/'+tag.slug">
            {{tag.name}}
          </nuxt-link>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Tweet from 'vue-tweet';
import { WidgetPost } from 'televue';
import type {IPost} from "~/types/interfaces";
import htmlDec from "~/helpers/htmlDec";

const props = defineProps<{
  post: IPost
}>()

const loadedPost = ref<HTMLElement>();

const tweets = ref([]);

const tweetDivs = ref<any[]>([]);

const tgs = ref([]);

const tgDivs = ref<any[]>([]);

const rating = ref<number>(0);

const {$singlePostDate} = useNuxtApp();

function rateChanged(rate: number) {
  rating.value = +rate;
}

function showExternal(): void {

  const twElems = loadedPost.value?.getElementsByClassName('tweet');

  if (twElems && twElems.length) {

    for (const item of twElems) {
      item.innerHTML = '';
      tweets.value.push(item.id as never);
    }


    nextTick(() => {
      tweetDivs.value.map((tweet, i) => {
        twElems[i].appendChild(tweet);
      })
    })
  }

  const tgElems = loadedPost.value?.getElementsByClassName('telega');

  if (tgElems && tgElems.length) {

    for (const item of tgElems) {
      item.innerHTML = '';
      tgs.value.push(item.id as never);
    }

    nextTick(() => {

      tgDivs.value.map((tg, i) => {
        tgElems[i].appendChild(tg);
      })
    })
  }
}

onMounted(()=>{
  rating.value = props.post!.rate;
  watch(
      () => loadedPost.value,
      () => {
        nextTick(()=>{
          showExternal();
        })
      },
  )
  showExternal();
})



</script>