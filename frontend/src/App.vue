<template>
  <div id="app">
    <ProductNavbar />
    <router-view />
  </div>
</template>

<script>
import ProductNavbar from './components/ProductNavbar.vue';

export default {
  components: {
    ProductNavbar,
  },
};
</script>