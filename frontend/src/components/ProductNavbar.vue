<template>
  <nav>
    <div>
      <span>INSPIRATION DVD STORE</span>
    </div>
    <div>
      <button v-if="!isLoggedIn" @click="goToLogin">Login</button>
      <button v-else @click="signOut">Sign Out</button>
      <button @click="goToCart">Cart</button>
    </div>
  </nav>
</template>

<script>
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../eventBus';

export default {
  setup() {
    const router = useRouter();

    const goToLogin = () => {
      router.push('/login');
    };

    const signOut = () => {
      localStorage.removeItem('token');
      isLoggedIn.value = false; 
      router.push('/products/list');
    };

    const goToCart = () => {
      router.push('/cart');
    };

    return {
      isLoggedIn,
      goToLogin,
      signOut,
      goToCart,
    };
  },
};
</script>