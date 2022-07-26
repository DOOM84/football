<template>
  <div class="content-grid">
    <div class="column-left boxShadow">
      <template v-if="team">
        <div class="center">
          <h1>{{ team.name }}</h1>
          <img class="teamImg" :src="team.img" alt="">
          <ul class="info-list">
            <li>
              Президент:
              <p>
                <strong>
                  {{ team.team_info.pres }}
                </strong>
              </p>
            </li>
            <li>
              Главный тренер:
              <p>
                <strong>
                  {{ team.team_info.coach }}
                </strong>
              </p>
            </li>
            <li>
              Стадион:
              <p>
                <strong>
                  {{ team.team_info.stad }}
                </strong>
              </p>
            </li>
            <li>
              Год основания:
              <p>
                <strong>
                  {{ team.team_info.year }}
                </strong>
              </p>
            </li>
            <li>
              Сайт клуба:
              <p>
                <a target="_blank" :href="team.team_info.site">{{ team.team_info.site }}</a>
              </p>
            </li>
          </ul>
        </div>
      </template>


      <TheTabsStands v-if="stands" :teams="stands.teams"/>
      <div v-if="ecup" class="mt-1">{{ ecup }}</div>
      <div v-if="ecupGroup" class="positions">
        <template v-for="(source, group) in ecupGroup">
          <TheTabsStands :teams="source.teams">
            <thead>
            <tr>
              <th class="center pl-1">#</th>
              <th class="center" colspan="2">Группа {{ group }}</th>
              <th class="center">И</th>
              <th class="center">О</th>
            </tr>
            </thead>
          </TheTabsStands>
        </template>
      </div>

      <ThePostsBase :posts="data.posts" :showMore="true"/>

    </div>
    <div class="column-right pl-1 pr-1">
      <h3>Состав</h3>
      <div class="row-content">
        <template v-for="player in data.players">
          <div>
            <ThePlayerCard :player="player"/>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>

const route = useRoute();

const initInfo = useInitInfo();

const champ = ref('');

const ecup = ref('');

const ecupGroup = ref('');

const team = ref();

const stands = ref();

const {data, error, pending} = await useAsyncData('team', () => $fetch('/api/team',
    {params: {team: route.params.id, count: 10}}), {initialCache: false})

for (let i = 0; i < initInfo.value.stands.length; i++) {

  const ind = initInfo.value.stands[i].teams.findIndex((tm) => {
    return tm.slug === route.params.id
  })

  if (ind > -1) {
    champ.value = initInfo.value.stands[i].champ.slug;
    team.value = initInfo.value.stands[i].teams[ind];
    stands.value = initInfo.value.stands.filter(item => item.champ.slug === champ.value)[0]
    break;
  }
}

if (team.value) {
  getEcup()
} else {
  throwError();
}


useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk + ' - Команда - ' + (team.value?.name ? team.value.name : '');
  }
})


function getEcup() {

  for (let i = 0; i < initInfo.value.ecup_stands.length; i++) {

    Object.keys(initInfo.value.ecup_stands[i].stands).map((group) => {

      const ind = initInfo.value.ecup_stands[i].stands[group].teams.findIndex((tm) => {
        return tm.slug === route.params.id
      })

      if (ind > -1) {
        ecup.value = initInfo.value.ecup_stands[i].name;
        ecupGroup.value = {[group]: initInfo.value.ecup_stands[i].stands[group]};
      }
    })

    if (ecup.value && ecupGroup.value) {
      break;
    }

  }
}


</script>

<style lang="scss" scoped>

.content-grid {
  grid-template-columns: 32% 1fr;
}

.teamImg {
  max-width: 151px;
}

.row-content {
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  justify-content: center;
  gap: 1rem;

  .row-item {
    width: 250px;
    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);

    .player-name {
      font-size: 1.5rem;
      font-weight: 400;
    }
  }
}

</style>