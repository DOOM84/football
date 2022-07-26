<template>
  <div class="positions relative" :class="classes">

    <div class="leftBtn">
      <i @click="swipeLeft" class="white fa-solid fa-less-than pointer"></i>
    </div>
    <div class="rightBtn">
      <i @click="swipeRight" class="white fa-solid fa-greater-than pointer"></i>
    </div>

    <ClientOnly>
      <div class="w100">
        <tabs :options="{ useUrlFragment: false }" :cache-lifetime="0" :navId="dataId" @clicked="tabClicked"
              @changed="tabChanged"
              nav-item-class="nav-item">
          <tab v-for="(source, index) in sources" :id="source[tabHead]?.slug || source.stage"
               :name="tabHead === 'group' ? 'Группа ' +index : source[tabHead]?.name
             || source.stage || 'Группа ' +index">
            <div id="pot">
              <TheTabsStands v-if="dataId.includes('stands')" :teams="source.teams"/>
              <TheTabsResults v-else-if="dataId.includes('results')" :tour="source.tour"/>
              <TheTabsScorers v-else-if="dataId.includes('scorers')" :players="source.players"/>
              <TheTabsEcupPoRes v-else-if="dataId.includes('ecuppo_res')" :tour="source"/>
              <TheTabsEcupGroupRes v-else-if="dataId.includes('ecupgr_res')" :tour="source"/>
            </div>
          </tab>
        </tabs>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const props = defineProps({
  tabHead: {type: String, default: 'champ'},
  dataId: {type: String, default: ''},
  sources: {type: [Array, Object], default: []},
  classes: {type: String, default: ''}
})

const tabIndex = ref(null)


function tabClicked(selectedTab) {

}

function tabChanged(selectedTab) {

  if (tabIndex.value !== null) {
    if (selectedTab.tab.index > tabIndex.value) {
      scrollTo(document.querySelector('#' + props.dataId), 60 + 16, 200);
    } else {
      scrollTo(document.querySelector('#' + props.dataId), -60 - 16, 200);
    }
  }

  tabIndex.value = selectedTab.tab.index;

  //console.log('Tab changed to:' + selectedTab.tab.index)
}

function scrollTo(element, scrollPixels, duration) {
  const scrollPos = element.scrollLeft;
  // Condition to check if scrolling is required
  if (!((scrollPos === 0 || scrollPixels > 0) && (element.clientWidth + scrollPos === element.scrollWidth || scrollPixels < 0))) {
    // Get the start timestamp
    const startTime =
        "now" in window.performance
            ? performance.now()
            : new Date().getTime();

    function scroll(timestamp) {
      //Calculate the timeelapsed
      const timeElapsed = timestamp - startTime;
      //Calculate progress
      const progress = Math.min(timeElapsed / duration, 1);
      //Set the scrolleft
      element.scrollLeft = scrollPos + scrollPixels * progress;
      //Check if elapsed time is less then duration then call the requestAnimation, otherwise exit
      if (timeElapsed < duration) {
        //Request for animation
        window.requestAnimationFrame(scroll);
      } else {
        return;
      }
    }

    //Call requestAnimationFrame on scroll function first time
    window.requestAnimationFrame(scroll);
  }
}

function swipeLeft() {
  scrollTo(document.querySelector('#' + props.dataId), -120 - 16, 200);
}

function swipeRight() {
  scrollTo(document.querySelector('#' + props.dataId), 120 + 16, 200);
}
</script>

<style lang="scss" scoped>
.leftBtn {
  position: absolute;
  left: 0;
  top: 0;

  i {
    background: black;
    padding: 0.9rem
  }
}

.rightBtn {
  position: absolute;
  top: 0;
  right: 0;

  i {
    z-index: 10;
    background: black;
    padding: 0.9rem
  }

}

.internal {
  width: 31.75%;
  height: 100%;
  text-align: center;
  display: inline-block;
}

.centerCnt {
  width: 100%;
  overflow: hidden;
  /*will change this to hidden later to deny scolling to user*/
  white-space: nowrap;
}

#pot {
  font-size: 14px;
  animation-duration: 0.3s;
  animation-name: slidein;
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