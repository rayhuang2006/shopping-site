<template>
  <nav class="navbar">
    <router-link to="/">
      <div class="navbar-brand">
        <img src="@/assets/logo2.png" alt="Logo" class="logo" />
        <span class="navbar-title">{{$t('ProductNavbar.Title')}}</span>
      </div>
    </router-link>
    <div class="navbar-menu">
      <span v-if="isLoggedIn">{{$t('ProductNavbar.Username')}}{{ username }}</span>
      <span v-if="isLoggedIn">{{ $t('ProductNavbar.Role')}}{{ role }}</span>
      <button v-if="!isLoggedIn" @click="goToLogin">{{ $t('ProductNavbar.SignIn') }}</button>
      <button v-else @click="signOut">{{ $t('ProductNavbar.SignOut') }}</button>
      <div class="cart-container" @mouseover="showCartPreview" @mouseleave="hideCartPreview">
        <button v-if="role !== 'admin'" @click="goToCart" class="cart-button">
          {{ $t('ProductNavbar.Cart') }}
          <span v-if="cartItems.length > 0" class="cart-badge">{{ cartItems.length }}</span>
        </button>
        <div v-if="isCartPreviewVisible" class="cart-preview">
          <ul v-if="cartItems.length > 0">
            <li v-for="item in cartItems" :key="item.productId">
              <div class="cart-item">
                <span class="item-name">{{ item.Product.name }}</span>
                <span class="item-quantity">{{ item.quantity }}</span>
              </div>
            </li>
          </ul>
          <p v-else>{{ $t('ProductNavbar.EmptyCart') }}</p>
        </div>
      </div>
      <button v-if="role === 'admin'" @click="goToAddProduct">{{ $t('ProductNavbar.Add') }}</button>
      <button @click="goToProductList">{{ $t('ProductNavbar.Home') }}</button>
      <img :src="localeImage" alt="locale" @click="changeLanguage" class="locale-image"/>
    </div>
  </nav>
</template>

<script>
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../eventBus';
import { useI18n } from 'vue-i18n';
import { ref, watch, computed, onMounted } from 'vue';

export default {
  setup() {
    const router = useRouter();
    const username = ref(localStorage.getItem('username') || '');
    const role = ref(localStorage.getItem('role') || '');
    const { locale } = useI18n();
    const localeImage = computed(() => require(`@/assets/${locale.value}.png`));
    const isCartPreviewVisible = ref(false);
    const cartItems = ref([]);

    watch(isLoggedIn, (newVal) => {
      if (newVal) {
        username.value = localStorage.getItem('username') || '';
        role.value = localStorage.getItem('role') || '';
      } else {
        username.value = '';
        role.value = '';
      }
    });

    const fetchCartItems = async () => {
      const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/cart/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      cartItems.value = data;
    };

    const showCartPreview = () => {
      fetchCartItems();
      isCartPreviewVisible.value = true;
    };

    const hideCartPreview = () => {
      isCartPreviewVisible.value = false;
    };

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

    onMounted(fetchCartItems);

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
      isCartPreviewVisible,
      cartItems,
      showCartPreview,
      hideCartPreview,
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

.navbar-title {
  color: #fff;
  text-decoration: none;
  font-size: 1.5rem;
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
  position: relative; /* 為了定位小紅點 */
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

.cart-container {
  position: relative;
}

.cart-preview {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  color: #000;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
  width: 250px;
}

.cart-preview ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.cart-preview li {
  margin-bottom: 10px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: bold;
}

.item-quantity {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 2px 5px;
}

.cart-preview p {
  text-align: center;
  font-weight: bold;
  color: #555;
}

.cart-badge {
  position: absolute;
  top: -10px;
  right: -20px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>