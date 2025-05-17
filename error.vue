<template>
  <div>
  <NuxtLayout name="default">
    <div class="error-content-holder theme-padding">
      <div class="error-content px-5">
        <h1>4<Icon name="emojione:soccer-ball" style="color: #333; font-size: calc(1em + 1vw)" class="py-0 m-0"/>4<span class="font-open-sans"> Ошибка</span></h1>
        <p class="mb-5">Сожалеем, но такой страницы не существует...</p>
        <button class="btn" @click="handleError" >Вернуться на главную</button>
      </div>
    </div>
  </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
//const error = useError();
const handleError = () => {
  clearError({
    redirect: '/',
  });
};
</script>

<style lang="scss" scoped>
/*h1 {
  font-size: 20px;
}*/
.error-content-holder{ text-align: center;}
.error-content{ display: inline-block;}
.error-content h1{ color: #333; font-size: calc(1em + 5vw)}
.error-content h1 span{ color: #ccc; text-transform: uppercase; font-weight: 400;}
.error-content h1 i{ font-size: calc(1em + 5vw)}
.error-content p{ text-transform: uppercase; font-size: 20px; color: #555;}
.font-open-sans{ font-family: 'Open Sans', sans-serif;}
.theme-padding{ padding: 80px 0;}
</style>