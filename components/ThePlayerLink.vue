<template>
  <div>
    <template v-if="props.slug">
      <nuxt-link class="hover:underline" :to="'/player/'+props.slug">
        <div class="flex items-center">
          <span :class="fontSz" v-if="props.number">{{ props.number }}.</span>
          <small v-if="props.pos" class="text-gray-500 mx-1">{{ getPos(props.pos) }}</small>
          <span :class="fontSz">{{ htmlDec(props.name) }}</span>
        </div>
      </nuxt-link>
    </template>
    <div class="flex items-center" v-else>
      <span :class="fontSz" v-if="props.number">{{ props.number }}.</span>
      <small v-if="props.pos" class="text-gray-500 mx-1">{{ getPos(props.pos) }}</small>
      <span v-if="props.name" :class="fontSz">{{htmlDec(props.name)}}</span>
    </div>
  </div>



</template>


<script lang="ts" setup>
import htmlDec from "~/helpers/htmlDec";

const props = defineProps({
  name: {type: String, default: ''},
  slug: {type: String, default: ''},
  number: {type: [String, Number], default: ''},
  pos: {type: String, default: ''},
  fontSz: {type: String, default: ''},
})

function getPos(pos: string) {

  if(!pos){return ''}

  if (pos.toLowerCase() === 'g') {
    return 'в'
  }

  if (pos.toLowerCase() === 'd') {
    return 'з'
  }

  if (pos.toLowerCase() === 'm') {
    return 'п'
  }

  if (pos.toLowerCase() === 'f') {
    return 'н'
  }

  return ''
}



</script>