<template>
  <tbody>
  <tr v-for="result in results">
    <td class="center res-time"><small :class="isLive(result.stamp*1000)">{{ result.time }}</small></td>
    <td class="center res-logo">
      <img class="team-logo" :alt="result.team1.name"
           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
           :style="`background: url('/teams.png') ${result.team1.sprite};`"/>
      <div>
        <nuxt-link class="res-team" v-if="result.team1.slug" :to="'/team/'+result.team1.slug">
          {{ result.team1.name }}
        </nuxt-link>
        <span class="res-team" v-else>
            {{ result.team1.name }}
         </span>
      </div>
    </td>
    <td class="center ">
      {{ result.res1 }}
    </td>
    <td class="center ">
      :
    </td>
    <td class="center ">
      {{ result.res2 }}
    </td>
    <td class="center res-logo">
      <img class="team-logo" :alt="result.team2.name"
           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
           :style="`background: url('/teams.png') ${result.team2.sprite};`"/>
      <div>
        <nuxt-link class="res-team" v-if="result.team2.slug" :to="'/team/'+result.team2.slug">
          {{ result.team2.name }}
        </nuxt-link>
        <span class="res-team" v-else>
            {{ result.team2.name }}
         </span>
      </div>
    </td>
  </tr>
  </tbody>
</template>

<script setup>
const {$diffDate} = useNuxtApp();
const props = defineProps({
  results: {type: Array, default: []},
})

function isLive(stamp) {
  const minutes = $diffDate(stamp);
  return (minutes > 0 && minutes <= 115) ? 'isLive' : ''
}

</script>

<style lang="scss" scoped>

.res-time {
  padding-left: 5px;
  width: 5%
}

.res-logo {
  padding: 0;
  margin: 0;
  width: 35%
}

.res-team {
  padding-left: 0;
  padding-right: 0;
  white-space: normal
}

.isLive {
  color: red;
}


</style>