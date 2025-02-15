<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <img src="@/assets/logo2.png" alt="Logo" class="logo" />
      <span>{{$t('ProductNavbar.Title')}}</span>
    </div>
    <div class="navbar-menu">
      <span v-if="isLoggedIn">{{$t('ProductNavbar.Username')}}{{ username }}</span>
      <span v-if="isLoggedIn">{{ $t('ProductNavbar.Role')}}{{ role }}</span>
      <button v-if="!isLoggedIn" @click="goToLogin">{{ $t('ProductNavbar.SignIn') }}</button>
      <button v-else @click="signOut">{{ $t('ProductNavbar.SignOut') }}</button>
      <button v-if="role === 'admin'" @click="goToAddProduct">{{ $t('ProductNavbar.Add') }}</button>
      <button v-else @click="goToCart">{{ $t('ProductNavbar.Cart') }}</button>
      <button @click="goToProductList">{{ $t('ProductNavbar.Home') }}</button>
      <img :src="localeImage" alt="locale" @click="changeLanguage" class="locale-image"/>
    </div>
  </nav>
</template>

<script>
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../eventBus';
import { useI18n } from 'vue-i18n';
import { ref, watch, computed } from 'vue';

export default {
  setup() {
    const router = useRouter();
    const username = ref(localStorage.getItem('username') || '');
    const role = ref(localStorage.getItem('role') || '');
    const { locale } = useI18n();
    const localeImage = computed(() => require(`@/assets/${locale.value}.png`));

    watch(isLoggedIn, (newVal) => {
      if (newVal) {
        username.value = localStorage.getItem('username') || '';
        role.value = localStorage.getItem('role') || '';
      } else {
        username.value = '';
        role.value = '';
      }
    });

    const changeLanguage = () => {
      locale.value = locale.value === "zh" ? "en" : "zh"; // Toggle between `zh` and `en`
      localStorage.setItem("user-locale", locale.value); // Save language to localStorage
    };

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
      localeImage,
      changeLanguage,
    };
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.navbar-menu {
  display: flex;
  align-items: center;
}

.navbar-menu span {
  margin-right: 15px;
}

.navbar-menu button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #555;
  color: #fff;
  border: none;
  cursor: pointer;
}

.navbar-menu button:hover {
  background-color: #777;
}

.locale-image {
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 10px;
}
</style>