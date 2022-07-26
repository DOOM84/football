<template>
  <vueper-slides :breakpoints="{
          600: {
    arrows: false,
    bulletsOutside: false
    }
        }" autoplay :slideRatio="1 / 2" :dragging-distance="50" fixed-height="473px" fade>
    <vueper-slide
        v-for="(post, i) in slides"
        :key="i"
        :image="post.images.original"
    >
      <template #content>
        <div class="slide-title">
          <nuxt-link :to="post.ecup ? '/ecup/'+ post.ecup + '/'+ post.slug : '/' + post.champ +'/' +post.slug">
            {{ post.title }}
          </nuxt-link>
        </div>
      </template>
    </vueper-slide>

  </vueper-slides>
</template>

<script setup>
const props = defineProps({
  slides: {type: Array, default: []},
})

</script>


<style scoped lang="scss">

.vueperslide {
  position: relative;
}

.slide-title {
  position: absolute;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  color: white;
  bottom: 10%;
  width: 100%;
  text-align: left;
  font-size: 1.5rem;
  line-height: 2rem;

  a {
    color: white;
  }
}
</style>
