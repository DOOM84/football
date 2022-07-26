<template>
  <footer class="center pt-1 pb-1 w100 d-flex">
    <div>
      © {{ new Date().getFullYear() }} — Новости еврофутбола. Связаться с <a class="white footerLink" target="_blank" href="https://designs.network">администратором</a>
    </div>
  </footer>
</template>

<style scoped lang="scss">

footer {
  justify-content: center;
  align-items: center;
  min-height: 60px;

  .footerLink {
    text-decoration: underline;
    &:hover{
      text-decoration: none;
    }
  }
}

</style>
