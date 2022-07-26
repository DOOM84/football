<template>
  <div v-if="!error" class="content-grid">
    <div class="column-left boxShadow">
      <div class="center">
        <h1>{{ data.player.name }}</h1>
        <img class="playerImg w100" @error="imageUrlAlt" :src="data.player.photo" alt="">
        <ul class="info-list">
          <li>
            Дата рождения:
            <p>
              <strong>
                {{ data.player?.birth?.date }}
              </strong>
            </p>
          </li>
          <li>
            Гражданство:
            <p>
              <strong>
                {{ data.player.country || data.player.nationality }}
              </strong>
            </p>
          </li>
          <li v-if="team">
            Клуб:
            <div>
              <img :alt="team.name" class="team-logo"
                   src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                   :style="`background: url('/teams.png') ${team.sprite};`"/>
            </div>
            <nuxt-link :to="'/team/'+data.player.team">
              <strong>
                {{ team.name }}
              </strong>
            </nuxt-link>
          </li>
          <li>
            Позиция:
            <p>
              <strong>
                {{ position }}
              </strong>
            </p>
          </li>
          <li>
            Рост/Вес:
            <p>
              <strong>
                {{ data.player.height }}/{{ data.player.weight }}
              </strong>
            </p>
          </li>
        </ul>
      </div>

      <TheTabsStands v-if="stands" :teams="stands.teams"/>

    </div>
    <div class="column-right pl-1 pr-1">
      <h3>Новости игрока</h3>
      <div class="row-content">
        <template v-for="post in data.posts">
          <ThePostCard :post="post"/>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();

const router = useRoute();

const initInfo = useInitInfo();

const champ = ref('');

const team = ref();

const stands = ref();

const {data, error, pending} = await useAsyncData('player', () => $fetch('/api/player',
    {params: {playerId: route.params.id, count: 100}}), {initialCache: false})


if (error?.value) {
  throwError(error.value)
}


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Игроки - ' + (data.value?.player.name ? data.value.player.name : '');
  }
})



function imageUrlAlt(event) {
  event.target.src = "/no_player.png"
}


onMounted(() => {

  for (let i = 0; i < initInfo.value.stands.length; i++) {

    const ind = initInfo.value.stands[i].teams.findIndex((tm) => {
      return tm.slug === data.value?.player.team
    })

    if (ind > -1) {
      champ.value = initInfo.value.stands[i].champ.slug;
      team.value = initInfo.value.stands[i].teams[ind];
      stands.value = initInfo.value.stands.filter(item => item.champ.slug === champ.value)[0]
      break;
    }
  }

})

const position = computed(() =>
    +data.value.player.position_id === 1 ? 'Голкипер' : +data.value.player.position_id === 2 ? 'Защитник' :
        +data.value.player.position_id === 3 ? 'Полузащитник' : +data.value.player.position_id === 4 ? 'Нападющий' : ''
)

</script>

<style lang="scss" scoped>

.content-grid {
  grid-template-columns: 32% 1fr;

  .playerImg {
    max-width: 150px;
  }
}


@media(max-width: 1000px) {
  .row-content {
    justify-content: center;
  }
}

</style>