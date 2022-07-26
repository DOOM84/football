<template>
  <aside id="sidenav" ref="sideNav" class="sidebar-left">
    <div id="hideNav" ref="hideNav" class="close-menu-toggle">
      <i @click="navToggle = false" class="fa fa-times fa-lg pointer openNav white mainHeader"></i>
    </div>
    <TheSearch :side="true"/>
    <TheUserPanel :side="true"/>

    <div class="aside-menu mt-2">
      <div class="side-menu-title" @click="toggleMenu">
        Чемпионаты
      </div>
      <ul class="sublist">
        <nuxt-link v-for="champ in headerInfo.champs" :to="'/'+champ.slug">
          <li> {{ champ.name }}</li>
        </nuxt-link>
      </ul>

      <div class="side-menu-title" @click="toggleMenu">
        Турнирные таблицы
      </div>
      <ul class="sublist">
        <nuxt-link v-for="champ in headerInfo.champs" :to="'/'+champ.slug+'/stands'">
          <li> {{ champ.name }}</li>
        </nuxt-link>
      </ul>

      <div class="side-menu-title" @click="toggleMenu">
        Календарь
      </div>
      <ul class="sublist">
        <nuxt-link v-for="champ in headerInfo.champs" :to="'/'+champ.slug+'/calendar'">
          <li> {{ champ.name }}</li>
        </nuxt-link>
      </ul>

      <template v-for="ecup in headerInfo.ecups">
        <div class="side-menu-title" @click="toggleMenu">
          {{ ecup.name }}
        </div>
        <ul class="sublist">
          <nuxt-link :to="'/ecup/'+ecup.slug">
            <li> Новости</li>
          </nuxt-link>
          <nuxt-link :to="'/ecup/'+ecup.slug+'/stands'">
            <li> Турнирные таблицы</li>
          </nuxt-link>
          <nuxt-link :to="'/ecup/'+ecup.slug+'/calendar'">
            <li> Календарь</li>
          </nuxt-link>
        </ul>
      </template>
    </div>
  </aside>
</template>

<script setup>

const sideNav = ref(null);
const hideNav = ref(null);
const navToggle = useNavToggle();

const props = defineProps({
  headerInfo: {type: Object, default: {}},
})

function toggleMenu(e) {
  e.target.nextElementSibling.classList.toggle('showMenu');
}

watch(navToggle, (value) => {
  value ? openNav() : closeNav();
});

function openNav() {
  sideNav.value.style.left = "0px";
  hideNav.value.style.display = "block";
  document.querySelector('#overlay').style.visibility = "visible";
  document.querySelector('#overlay').style.opacity = "0.5";
  document.body.classList.toggle('noScroll');
}

function closeNav() {
  sideNav.value.style.left = "-250px";
  document.querySelector('#overlay').style.opacity = "0";
  document.querySelector('#overlay').style.visibility = "hidden"
  hideNav.value.style.display = "none";
  document.body.classList.toggle('noScroll');
}

</script>

<style lang="scss" scoped>
.sidebar-left {
  font-size: 16px;
  width: 250px;
  height: 100%;
  left: -250px;
  position: fixed;
  top: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 30px;
  z-index: 4;

  .close-menu-toggle {
    position: absolute;
    right: 1rem;
    top: 1rem
  }

  .title-link span {
    padding: 8px 8px 8px 32px;
  }

  a {
    padding: 8px 8px 8px 32px;
    text-decoration: none;
    color: #f1f1f1;
    display: block;
    transition: 0.3s;
  }

  a:hover, i:hover {
    color: #818181;
    transition: 0.3s;
  }

  .aside-menu {
    font-weight: 500;
    text-transform: uppercase;
    color: white;

    .side-menu-title {

      cursor: pointer;
      padding-left: 1rem;

    }

    .sublist {

      background: #27482d;

      visibility: hidden;
      height: 0;

      margin-top: 1rem;
      margin-bottom: 1rem;

      a {
        color: white;

        &:hover {
          background: rgba(142, 142, 142, 0.3);
        }

      }

      box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
      text-transform: none;
      font-weight: normal;
      font-size: 1rem;
      width: 100%;
      list-style-type: none;
      padding: 0;
      border: none;

      li {
        text-align: left;
        display: none;
      }
    }

    .showMenu {
      visibility: visible;
      height: 100%;
      animation: rotateMenu 400ms ease-in-out forwards;
      transform-origin: top center;

      li {
        display: block;
      }
    }

  }


  .header-btn {

    font-weight: 600;
    font-size: .875rem;
    position: relative;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease-out;
    background: transparent;
    color: #fff;
    padding-left: 10px;
    padding-right: 10px;
    text-transform: uppercase;
    margin-right: 20px;

    &:hover {
      background: rgba(142, 142, 142, 0.2);
    }

    i {
      padding-right: 10px;
    }
  }


  @keyframes rotateMenu {
    0% {
      transform: rotateX(-90deg)
    }
    70% {
      transform: rotateX(20deg)
    }
    100% {
      transform: rotateX(0deg)
    }
  }

}
</style>