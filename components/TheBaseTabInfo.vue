<template>
    <table class="w-full pt-0 mt-0 border-collapse text-[14px] mb-5">
        <slot v-if="infoType !== 'shortResults' &&
        infoType !== 'fullStands' && infoType !== 'fullResults' && infoType !== 'ecupResults'
        && infoType !== 'ecupPoResults' && infoType !== 'ecupPoFullResults'&& infoType !== 'ecupGroupFullResults'">
            <thead class="pt-0 mt-0">
            <tr>
                <th class="text-center pl-1 py-[0.7rem] bg-zinc-100">#</th>
                <th colspan="2" class="text-left py-[0.7rem] bg-zinc-100">Команда</th>
                <th class="text-center py-[0.7rem] bg-zinc-100">И</th>
                <th class="text-center py-[0.7rem] bg-zinc-100">О</th>
            </tr>
            </thead>
        </slot>
        <tbody v-if="infoType === 'shortStands'">
        <template v-for="(team, i) in infoToShow" :key="'shortStands '+i">
            <TheShortStands :info="team" :ind="i"/>
        </template>
        </tbody>

        <template v-else-if="infoType === 'fullStands'">
        <TheFullStands :info="infoToShow as ITeam[]"/>
        </template>

        <template v-else-if="infoType === 'fullResults'">
            <TheFullResults :info="infoToShow"/>
        </template>

        <template v-else-if="infoType === 'shortResults'"
                  v-for="(results, date, i) in ((infoToShow as Record<string, any>)?.tour.scores ? sortObj((infoToShow as Record<string, any>)?.tour?.scores) :  (infoToShow as Record<string, any>)?.tour.scores)"
                  :key="'shortResults '+i"
        >
            <thead>
            <tr>
                <th colspan="6" class="center py-[0.7rem] bg-zinc-100">
                  {{ (infoToShow as any)?.tour.scores[date][0]['tour'] !== 99 ? (infoToShow as any)?.tour.scores[date][0]['tour']+'-й тур.' : ''  }} {{ $resultDate(+date) }}
                </th>
            </tr>
            </thead>
            <tbody>
            <TheShortResults :iter="i" :results="results"/>
            </tbody>
        </template>

      <template v-else-if="infoType === 'ecupResults'"
                v-for="(results, date, i) in infoToShow"
                :key="'ecupResults '+i">
        <thead>
        <tr>
          <th colspan="6" class="text-center py-[0.7rem] bg-zinc-100">{{ $resultDate(+date) }}</th>
        </tr>
        </thead>
        <tbody>
        <TheShortResults :iter="i"  :results="results"/>
        </tbody>
      </template>

<!--        <template v-else-if="infoType === 'ecupResults'"
                  v-for="(info, tourNum, i) in infoToShow"
                  :key="'ecupResults '+i">
            <template v-for="(results, date) in sortObj(info)" :key="'dateResults '+date">
                <thead>
                <tr>
                    <th colspan="6" class="text-center pt-1 pb-1">{{ tourNum }}-й тур, {{ $resultDate(+date) }}</th>
                </tr>
                </thead>
                <tbody>
                <TheShortResults :iter="i"  :results="results"/>
                </tbody>
            </template>
        </template>-->

        <template v-else-if="infoType === 'ecupPoResults'"
                  v-for="(results, date, i)  in (infoToShow ? sortObj(infoToShow) :  infoToShow)"
                  :key="'ecupPoResults '+i"
        >
        <thead>
            <tr>
                <th colspan="6" class="text-center pt-1 pb-1">{{ $resultDate(+date) }}</th>
            </tr>
            </thead>
            <tbody>
            <TheShortResults :iter="i" :results="results"/>
            </tbody>
        </template>


        <template v-else-if="infoType === 'ecupGroupFullResults'"
                  v-for="(tour, group) in sortObj(infoToShow as Record<string, any>)"
                  :key="'ecupGroupFullResults '+group"
        >
                <thead>
                <tr>
                    <th colspan="6" class="text-center py-3 bg-zinc-800 text-zinc-100">
                      {{group !== 'null' ? 'Группа '+group : 'Фаза лиги' }}
                    </th>
                </tr>
                </thead>
                <template v-for="(info, tourNum, i) in tour"  :key="'tourNum '+i">

                    <template v-for="(results, date) in sortObj(info)" :key="'infoDate '+date">
                        <thead>
                        <tr>
                            <th colspan="6" class="text-center py-[0.7rem] bg-zinc-100">
                                {{ tourNum }}-й тур, {{ $resultDate(+date) }}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <TheShortResults :iter="i" :results="results"/>
                        </tbody>
                    </template>
                </template>
            </template>


        <template v-else-if="infoType === 'ecupPoFullResults'" v-for="(source, i) in infoToShow" :key="'source'+i">
            <thead>
            <tr>
                <th colspan="6" class="text-center py-3 bg-zinc-800 text-zinc-100">
                    {{ source.stage }}
                </th>
            </tr>
            </thead>
            <template v-for="(results, date, i) in sortObj(source.scores)" :key="'scores'+i">
                <thead>
                <tr>
                    <th colspan="6" class="text-center py-[0.7rem] bg-zinc-100">{{ $resultDate(+date) }}</th>
                </tr>
                </thead>
                <tbody>
                <TheShortResults :iter="i" :results="results"/>
                </tbody>
            </template>
        </template>


        <tbody v-else-if="infoType === 'scorers'">
        <template v-for="(player, i) in (infoToShow as Record<string, any>)?.players"
                  :key="'scorers '+i">
            <TheScorers :player="player"/>
        </template>
        </tbody>

        <tbody v-else-if="infoType === 'ecupTableStands'">
        <template v-for="(team, i) in infoToShow" :key="'ecupTableStands '+i">
            <TheShortStands :info="team" :ind="i"/>
        </template>
        </tbody>

        <tbody v-else-if="infoType === 'ecupTableFullStands'">
        <template v-for="(team, i) in infoToShow" :key="'ecupTableFullStands '+i">
            <TheEcupFullStands :info="team" :ind="i"/>
        </template>
        </tbody>

        <tbody v-else-if="infoType === 'ecupStands'">
        <template v-for="(team, i) in (infoToShow as Record<string, any>)?.teams" :key="'ecupStands '+i">
            <TheShortStands :info="team" :ind="i"/>
        </template>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import type {ITeam} from "~/types/interfaces";

const {$resultDate} = useNuxtApp();
import sortObj from "~/helpers/sortObj";

const props = defineProps({
    infoType: String,
    infoToShow: [Object, Array],
})
</script>

<style scoped>

</style>