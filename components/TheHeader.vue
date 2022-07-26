<template>
  <div @click="toggleNav(false)" ref="overlay" id="overlay" class="bg"></div>
  <header class="w100 mainHeader">
    <div class="menu-toggle">
      <i @click="toggleNav(true)" class="fas fa-bars fa-lg pointer white"></i>
    </div>
    <div class="d-flex white pl-2 main-header">
      <div>
        <nuxt-link to="/">
          <h1 class="title">
            НОВОСТИ ЕВРОФУТБОЛА
          </h1>
        </nuxt-link>
      </div>
      <TheSearch/>

      <TheUserPanel/>

    </div>

    <div class="second-header-wrap">
      <div class="second-header-item">
        <div>
          Чемпионаты
          <ul class="sublist">
            <nuxt-link v-for="champ in headerInfo.champs" :to="'/'+champ.slug">
              <li> {{ champ.name }}</li>
            </nuxt-link>
          </ul>
        </div>
      </div>
      <div class="second-header-item">
        <div>
          Турнирные таблицы
          <ul class="sublist">
            <nuxt-link v-for="champ in headerInfo.champs" :to="'/'+champ.slug+'/stands'">
              <li> {{ champ.name }}</li>
            </nuxt-link>
          </ul>
        </div>
      </div>
      <div class="second-header-item">
        <div>
          Календарь
          <ul class="sublist">
            <nuxt-link v-for="champ in headerInfo.champs" :to="'/'+champ.slug+'/calendar'">
              <li> {{ champ.name }}</li>
            </nuxt-link>
          </ul>
        </div>
      </div>
      <div v-for="ecup in headerInfo.ecups" class="second-header-item">
        <div>
          {{ ecup.name }}
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
        </div>
      </div>
    </div>
  </header>
  <TheAside :headerInfo="headerInfo"/>
</template>

<script setup>
const overlay = ref(null);

const initInfo = useInitInfo();

const navToggle = useNavToggle();

function toggleNav(flag) {
  navToggle.value = flag;
}

const headerInfo = computed(() => {
  const ecups = initInfo.value.ecup_stands.map((ecup) => ({
    name: ecup.name,
    slug: ecup.slug
  }))

  const champs = initInfo.value.stands.map((champ) => ({
    name: champ.champ.name,
    slug: champ.champ.slug
  }))

  return {
    champs,
    ecups
  }

})

</script>


<style scoped lang="scss">

header {

  .menu-toggle {
    display: none;
  }

  a {
    color: white;
  }

  height: 115px;

  .main-header {
    background: #272727;
    height: 60px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 1.8rem;
      font-weight: 900;
      padding: 0;
      margin: 0;
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
  }

  .second-header-wrap {
    display: flex;
    flex-direction: row;
    height: 55px;
    justify-content: center;
    background: #eceff1;
    font-weight: 500;
    text-transform: uppercase;

    .second-header-item {
      z-index: 10;
      position: relative;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: .875rem;
      padding-left: 1.7rem;
      padding-right: 1.7rem;

      .sublist {
        a {
          color: black;
        }

        box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
        text-transform: none;
        font-weight: normal;
        font-size: 1rem;
        width: 100%;
        position: absolute;
        list-style-type: none;
        left: 0;
        top: 100%;
        background: white;
        border-radius: 5px;
        display: none;
        padding: 0;
        border: none;

        li {
          //padding: 1rem 0;
          display: inline-block;
          text-align: left;
          padding: 15px 15px;
          height: 100%;
          width: 100%;

          &:hover {
            background: rgba(142, 142, 142, 0.1);
          }
        }
      }


      &:hover {
        .sublist {
          display: block;
          animation: rotateMenu 400ms ease-in-out forwards;
          transform-origin: top center;
        }

        background: rgba(142, 142, 142, 0.1);
      }


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


.sidenav {
  font-size: 16px;
  width: 250px;
  height: 100%;
  left: -250px;
  position: fixed;
  top: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  z-index: 4;

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

  .closeBtn {
    position: absolute;
    top: 10px;
    right: 25px;
    margin-left: 50px;
  }

  .loginbtn {
    position: absolute;
    top: 0;
    left: 10px;
  }
}

@media(max-width: 450px) {

  .siteName {
    display: none;
  }
}

</style>
