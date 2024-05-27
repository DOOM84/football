<template>
    <div>
      <div v-if="pending || !data" class="col-span-3 text-center pt-10">
        <Icon name="svg-spinners:12-dots-scale-rotate" size="80"/>
      </div>
      <template v-else>
        <div class="p-4">Новости по тегу {{data.tag.name}} </div>
        <div class="px-1 mt-4 flex flex-wrap text-center justify-center gap-4 ">
            <ThePostsCard :post="post" :m-width="+280" v-for="post in data.posts" :key="post.slug"/>
        </div>

        <div class="p-4 mt-3">
          <TheLoadMore @addPosts="addPosts" :limit="5" :tag-id="data.tag.id" :my="0" :count="data.posts.length" />
        </div>


      </template>
    </div>

</template>

<script setup lang="ts">
import type {IPost, ITag} from "~/types/interfaces";

const route = useRoute();

const {data, pending, error} = await useLazyFetch<{ posts: IPost[]; tag: ITag}>('/api/tag', {params: {slug: route.params.id}, onResponseError({request, response, options}) {
    showError({
      fatal: true,
      statusCode: 404,
      message: 'Страница не найдена'
    })
  }})

if (error.value) {
  throw createError({
    fatal: true,
    statusCode: 404,
    message: 'Страница не найдена'
  })
}

const title = computed(()=> 'Новости европейского футбола - Новости по тегу - ' + data.value?.tag?.name)

useSeoMeta({
  title: () => title.value,
});

function addPosts(loadedPosts: IPost[]): void {
  data.value?.posts.push(...loadedPosts)
}
</script>

<style scoped>

</style>