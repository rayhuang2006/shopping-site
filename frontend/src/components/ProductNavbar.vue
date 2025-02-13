<template>
  <nav>
    <div>
      <span>INSPIRATION DVD STORE</span>
    </div>
    <div>
      <span v-if="isLoggedIn">username: {{ username }}</span>
      <span v-if="isLoggedIn">role:  {{ role }}</span>
      <button v-if="!isLoggedIn" @click="goToLogin">Login</button>
      <button v-else @click="signOut">Sign Out</button>
      <button v-if="role === 'admin'" @click="goToAddProduct">Add</button>
      <button v-else @click="goToCart">{{ $t('Cart') }}</button>
      <button @click="goToProductList">Home</button>
    </div>
  </nav>
</template>

<script>
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../eventBus';
import { ref } from 'vue';

export default {
  setup() {
    const router = useRouter();
    const username = ref(localStorage.getItem('username') || '');
    const role = ref(localStorage.getItem('role') || '');

    const goToLogin = () => {
      router.push('/login');
    };

    const signOut = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      isLoggedIn.value = false; 
      router.push('/products/list');
    };

    const goToCart = () => {
      router.push('/cart');
    };

    const goToAddProduct = () => {
      router.push('/products/add');
    };

    const goToProductList = () => {
      router.push('/products/list');
    };

    return {
      isLoggedIn,
      username,
      role,
      goToLogin,
      signOut,
      goToCart,
      goToAddProduct,
      goToProductList,
    };
  },
};
</script>