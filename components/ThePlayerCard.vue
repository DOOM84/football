<template>
  <nuxt-link :to="'/player/'+(player.objectID || player.slug)">
    <div class="row-item relative">
      <button v-if="showDelete" class="delButton"
              @click.prevent="removePlayer">
        <i class="fas fa-trash pointer"></i>
      </button>

      <img @error="imageUrlAlt" class="playerImg" :src="player.photo" alt="">
      <div class="pl-1 pb-1">
        <div class="d-flex g-1">
          <img v-if="showTeam" class="team-logo" :alt="team.name" :title="team.name"
               src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
               :style="`
             background: url('/teams.png') ${team.sprite};`"/>
          <div class="left player-name pr-1">{{ player.name }}</div>

        </div>
        <div v-if="player.position || player.number" class="left">{{ position }} {{ player.number }}</div>

        <div v-if="showSlug" @click.prevent class="d-flex s-between">

          <input v-model="player.slug" type="text" class="playerSlug">

          <button @click.prevent="savePlayerSlug" class="saveBtn">
            <i class="fas fa-save pointer mr-1"></i>
          </button>

        </div>

      </div>
    </div>
  </nuxt-link>
</template>

<script setup>
const props = defineProps({
  player: {type: Object, default: {}},
  showTeam: {type: Boolean, default: false},
  showDelete: {type: Boolean, default: false},
  showSlug: {type: Boolean, default: false},
})

const emit = defineEmits(['removePlayer', 'editSlug'])

const initInfo = useInitInfo();

const team = computed(() => {
  for (let i = 0; i < initInfo.value.stands.length; i++) {

    const ind = initInfo.value.stands[i].teams.findIndex((tm) => {
      return tm.slug === props.player.team
    })

    if (ind > -1) {
      return {
        name: initInfo.value.stands[i].teams[ind].name,
        sprite: initInfo.value.stands[i].teams[ind].sprite
      }
    }
  }

  return null;
})

function removePlayer() {
  if (confirm('Вы уверены? Игрок будет удален из команды, но останется в каталоге.')) {
    emit('removePlayer', props.player.id);
  }

}

function savePlayerSlug() {

  emit('editSlug', {id: props.player.id, slug: props.player.slug});

}

function imageUrlAlt(event) {
  event.target.src = "/no_player.png"
}

const position = computed(() =>
    props.player?.position.toLowerCase() === 'goalkeeper'
        ? 'Голкипер' : props.player?.position.toLowerCase() === 'defender' ? 'Защитник' :
            props.player?.position.toLowerCase() === 'midfielder'
                ? 'Полузащитник' : props.player?.position.toLowerCase() === 'attacker' ? 'Нападющий' : ''
)


</script>

<style scoped lang="scss">
.row-item {
  width: 250px;
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);

  .playerImg {
    width: 150px;
  }

  .playerSlug {
    padding: 3px;
    width: 80%;
  }

  .saveBtn {
    border: none;
    background: none;
  }

  .delButton {
    position: absolute;
    right: 5px;
    top: 5px;
    border: none;
  }

  .player-name {
    font-size: 1.5rem;
    font-weight: 400;
  }
}
</style>