import StarRating from 'vue-star-rating'

export default defineNuxtPlugin(nuxtApp => {

   nuxtApp.vueApp.component('star-rating', StarRating);

})



