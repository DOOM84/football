<template>
  <Transition name="modal">
    <div v-if="show" @click.self="close"  class="modal-mask overflow-y-scroll">
      <div v-click-outside="close" ref="target" class="modal-container relative"
           :class="noBg ? 'bg-transparent': 'bg-white'"
           :style="`max-width: ${maxW}px`">
        <TheLoading :show-load="showLoading" :full-page="false" />
<!--        <div class="modal-header">
          <slot name="header">
            <button
                class="modal-default-button"
                @click="$emit('close')"
            >OK</button>
          </slot>
        </div>-->

        <button
            class="absolute right-3 top-3 text-xl font-bold"
            :class="'text-zinc-'+closeColor"
            @click="$emit('close')"
        >
          <Icon name="material-symbols:close"
                size="20"/>
        </button>

        <div class="modal-body">
          <slot name="body">default body {{maxW}}</slot>
        </div>

<!--        <div class="modal-footer">
          <slot name="footer">
            default footer
            <button
                class="modal-default-button"
                @click="$emit('close')"
            >OK</button>
          </slot>
        </div>-->
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>

const props = withDefaults(defineProps<{
  show?: boolean;
  noBg?: boolean;
  showLoading?: boolean;
  closeByOutClick?: boolean;
  closeColor?: string;
  maxW?: string
}>(), {
  show: false,
  noBg: false,
  showLoading: false,
  closeByOutClick: false,
  closeColor: '800',
  maxW: '1000',

})
const emit = defineEmits<{
  (e: 'close'): void
}>()
function close(): void {
  if(props.closeByOutClick){
    emit('close')
  }
}
</script>

<style lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  transition: opacity 0.3s ease;
  overflow-y: scroll;
 /* overflow-y: auto;*/

  .modal-container {
    /*height: 100%;*/
    /*max-width: 100%;*/
    width: 1000px;
    /*max-width: 1000px;*/
    margin: auto;
    padding: 20px 30px;
    //background-color: transparent;
    border-radius: 2px;
    //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    //overflow-y: scroll;

    .modal-header h3 {
      margin-top: 0;
      color: #42b983;
    }

    .modal-body {
      margin: 20px 0;
    }

    /*.modal-default-button {
      float: right;
    }*/
  }
}


/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>