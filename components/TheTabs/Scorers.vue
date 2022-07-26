<template>
  <table class="w100 pt-1 table-info">
    <thead>
    <tr>
      <th class="left pl-1" colspan="2">Игрок</th>
      <th class="center">Голы</th>
    </tr>
    </thead>
    <tbody>
    <template v-for="(player, i) in players">
      <tr>
        <td class="center pt-1">
          <img class="team-logo" :alt="player.team.name" :title="player.team.name"
               src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
               :style="`
             background: url('/teams.png') ${player.team.sprite};`"/>
        </td>
        <td class="left pt-1">
          <nuxt-link :to="'/player/'+player.slug">
            {{ player.name }}
          </nuxt-link>
        </td>
        <td class="center pt-1">
          {{ player.goals }}
        </td>
      </tr>
    </template>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  players: {type: Array, default: []},
})
</script>