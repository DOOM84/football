<template>
  <table class="w100 pt-1 table-info">
    <slot>
      <thead>
      <tr>
        <th class="center pl-1">#</th>
        <th class="left"></th>
        <th class="left">Команда</th>
        <th class="center">И</th>
        <th class="center">О</th>
      </tr>
      </thead>
    </slot>
    <tbody>
    <template v-for="(team, i) in filterTeams(teams)">
      <tr>
        <td class="center pt-1 pl-1">
          {{ +i + 1 }}
        </td>
        <template v-if="fullStands">
          <td class="center pt-1 image-logo">
            <img :alt="team.name" class="team-logo"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                 :style="`background: url('/teams.png') ${team.sprite};`"/>
          </td>
          <td class="left pt-1">
            <nuxt-link v-if="team.slug" :to="'/team/'+team.slug">
              {{ team.name }}
            </nuxt-link>
            <span v-else>
            {{ team.name }}
            </span>
          </td>
          <td class="center pt-1 played-points">
            {{ team.games }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.win }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.draw }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.lost }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.goals }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.missed }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.diff }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.points }}
          </td>
        </template>
        <template v-else>
          <td class="center pt-1 image-logo">
            <img :alt="team.name" class="team-logo"
                 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
                 :style="`background: url('/teams.png') ${team.sprite};`"/>
          </td>
          <td class="left pt-1">
            <nuxt-link v-if="team.slug" :to="'/team/'+team.slug">
              {{ team.name }}
            </nuxt-link>
            <span v-else>
            {{ team.name }}
            </span>
          </td>
          <td class="left pt-1 played-games">
            {{ team.games }}
          </td>
          <td class="center pt-1 played-points">
            {{ team.points }}
          </td>
        </template>
      </tr>
    </template>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  teams: {type: Array, default: []},
  fullStands: {type: Boolean, default: false},
})

function filterTeams(teams) {
  return teams.length > 4 ? teams.filter(t => t.hasOwnProperty('status') && t.status === true) : teams;
}
</script>

<style lang="scss" scoped>
.image-logo {
  padding-left: 0.3rem;
  padding-right: 0.3rem;
}

.played-games {
  padding-left: 0.2rem;
}

.played-points {
  padding-left: 0.5rem;
  padding-right: 0.5rem
}
</style>