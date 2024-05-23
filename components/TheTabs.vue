<template>
    <div>
        <div class="flex gap-2 items-center bg-zinc-800 py-3 text-zinc-200">
            <div @click.prevent="scrollRun('left')" class="px-2 cursor-pointer">
                <Icon name="mdi:arrow-left" size="20px" class="py-0 m-0"/>
            </div>
            <div ref="champsBox" class="flex overflow-hidden gap-5 uppercase">
                <div v-if="infoType === 'shortStands'" v-for="(champ, i) in champs"
                     :key="infoType + ' ' + champ.name" @click.prevent="showInfo($event, i)"
                     class="cursor-pointer underline-offset-4 text-[14px] font-semibold">
                    {{ champ.name }}
                </div>
                <div v-else-if="infoType === 'shortResults'" v-for="(champ, i) in tourResults"
                     :key="infoType + ' ' + champ.champ.name" @click.prevent="showInfo($event, i)"
                     class="cursor-pointer underline-offset-4 text-[14px] font-semibold">
                    {{ champ.champ.name }}
                </div>
                <div v-else-if="infoType === 'scorers'" v-for="(champ, i) in scorers"
                     :key="infoType + ' ' + champ.champ.name" @click.prevent="showInfo($event, i)"
                     class="cursor-pointer underline-offset-4 text-[14px] font-semibold">
                    {{ champ.champ.name }}
                </div>
                <div v-else-if="infoType === 'ecupStands'" v-for="(ecup, group) in sortObj(ecupStands.stands)"
                     :key="infoType + ' ' + ecupStands.slug"
                     @click.prevent="showInfo($event, group)"
                     class="cursor-pointer underline-offset-4 text-[14px] font-semibold whitespace-nowrap">
                   Группа {{ group }}
                </div>

                <div v-else-if="infoType === 'ecupResults'" v-for="(info, group) in sortObj(ecupResults)"
                     :key="infoType + ' ' + group"
                     @click.prevent="showInfo($event, group)"
                     class="cursor-pointer underline-offset-4 text-[14px] font-semibold whitespace-nowrap">
                    Группа {{ group }}
                </div>

                <div v-else-if="infoType === 'ecupPoResults'" v-for="(info, i) in ecupPoResults"
                     :key="infoType + ' ' + i"
                     @click.prevent="showInfo($event, i)"
                     class="cursor-pointer underline-offset-4 text-[14px] font-semibold whitespace-nowrap">
                    {{ info.stage }}
                </div>
            </div>
            <div @click.prevent="scrollRun('right')" class="px-2 cursor-pointer ml-auto">
                <Icon name="mdi:arrow-right" size="20px"/>
            </div>
        </div>
        <transition name="slidecnt">
            <div :key="infoToShow" class="overflow-hidden hover:overflow-visible">
                <TheBaseTabInfo :info-to-show="infoToShow" :info-type="infoType">
                    <slot></slot>
                </TheBaseTabInfo>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import type {IChampDB, ITour} from "~/types/interfaces";
import sortObj from "~/helpers/sortObj";

const props = defineProps<{
    champs?: IChampDB[],
    tourResults?: ITour[],
    ecupStands?: {},
    ecupResults?: {},
    ecupPoResults?: any[],
    scorers?: any[],
    infoType?: string,
}>()

const tabInd = ref<number>(0);

const infoToShow = ref();

const currentResultInd = ref<number>(0)

const currentEcupResultInd = ref<number | string>(0)

const currentEcupPoResultInd = ref<number | string>(0)

const champsBox = ref<HTMLElement>();

//const IntObserver = ref<IntersectionObserver>()

watch(
    () => props.tourResults,
    () => {
      infoToShow.value = props.tourResults[currentResultInd.value as number]
    },
    { deep: true }
)

watch(
    () => props.ecupResults,
    () => {
      infoToShow.value = props.ecupResults[currentEcupResultInd.value as string]
    },
    { deep: true }
)

watch(
    () => props.ecupPoResults,
    () => {
      infoToShow.value = props.ecupPoResults[currentEcupPoResultInd.value as number].scores
    },
    { deep: true }
)

onMounted(() => {

    if(props.infoType === 'shortStands'){
        infoToShow.value = filterTeams(props.champs[0].teams);
    }else if(props.infoType === 'shortResults'){
      infoToShow.value = props.tourResults[0]
    }else if(props.infoType === 'scorers'){
        infoToShow.value = props.scorers[0]
    }else if(props.infoType === 'ecupStands'){
        infoToShow.value = Object.values(sortObj(props.ecupStands.stands))[0]
    }else if(props.infoType === 'ecupResults'){
      infoToShow.value = Object.values(sortObj(props.ecupResults))[0];
      currentEcupResultInd.value = Object.keys(sortObj(props.ecupResults))[0];
    }else if(props.infoType === 'ecupPoResults'){
        infoToShow.value = props.ecupPoResults[0].scores
    }

    champsBox.value?.children[0].classList.add('underline');
})


function scrollRun(dir: string) {

    sideScroll('', dir, 25, 120, 10);

}

function sideScroll(element: any, direction: string, speed: number, distance: number, step: number): void {

    /*if (IntObserver.value) {
        IntObserver.value.disconnect();
    }*/
    let scrollAmount = 0;
    const slideTimer = setInterval(function () {
        if (direction == 'left') {
            champsBox.value.scrollLeft -= step;
        } else {
            champsBox.value.scrollLeft += step;
        }
        scrollAmount += step;
        if (scrollAmount >= distance) {
            window.clearInterval(slideTimer);
        }
    }, speed);
}

function filterTeams(teams) {
    return teams.length > 4 ? teams.filter(t => t.hasOwnProperty('status') && t.status === true) : teams;
}

function showInfo(event: { target: HTMLElement }, i: number | string) {

    const currentTab: number = (typeof i === 'string') ? i.toLowerCase().charCodeAt(0) - 97 : i;

    if(tabInd.value === currentTab){return}

    if(props.infoType === 'shortStands'){
        infoToShow.value = filterTeams(props.champs[i].teams);
    }else if(props.infoType === 'shortResults'){
        currentResultInd.value = i as number;
        infoToShow.value = props.tourResults[i] //JSON.parse(JSON.stringify(props.tourResults[i]))
    }else if(props.infoType === 'scorers'){
        infoToShow.value = props.scorers[i]
    }else if(props.infoType === 'ecupStands'){
        infoToShow.value = props.ecupStands.stands[i]
    }else if(props.infoType === 'ecupResults'){
      currentEcupResultInd.value = i as string;
      infoToShow.value = props.ecupResults[i];
    }else if(props.infoType === 'ecupPoResults'){
        currentEcupPoResultInd.value = i as string;
        infoToShow.value = props.ecupPoResults[i].scores
    }

    //const elemWidth = event.target.offsetWidth;

    const parentEl = event.target.parentElement;

    //const parentWidth = parentEl.offsetWidth;

    for (let i = 0; i < parentEl.children.length; i++) {
        parentEl.children[i].classList.remove('underline')
    }

    event.target.classList.add('underline');

    if(currentTab > tabInd.value){
        sideScroll('', 'right', 25, 70, 10);
    }else{
        sideScroll('', 'left', 25, 70, 10);
    }

    tabInd.value = currentTab;

    /*IntObserver.value = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) {

            const rect1 = champsBox.value.getBoundingClientRect();
            const rect2 = event.target.getBoundingClientRect();
            const leftPos = rect2.left - rect1.left;

            const shiftTo = elemWidth - (elemWidth * entries[0].intersectionRatio)
            if (leftPos > parentWidth / 2) {
                sideScroll('', 'right', 25, shiftTo + 50, 10);
            } else {
                sideScroll('', 'left', 25, shiftTo + 50, 10);
            }
        } else {
            IntObserver.value?.disconnect()
        }

    }, {threshold: [1]});

    IntObserver.value.observe(event.target);*/
}
</script>

<style scoped>

.slidecnt-enter-active {
    animation: slidein 0.3s;
}

.slidecnt-leave-to, .slidecnt-leave-active {
    display: none;
}

@keyframes slidein {
    from {
        margin-left: 80%;
    }

    to {
        margin-left: 0;
    }
}
</style>