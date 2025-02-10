<template>
  <div>
    <h2>Shopping Cart</h2>
    <div v-if="cartItems.length === 0">
      <p>Your cart is empty.</p>
    </div>
    <div v-else>
      <ul>
        <li v-for="item in cartItems" :key="item.productId">
          <h3>{{ item.Product.name }}</h3>
          <p>Price: {{ item.Product.price }}</p>
          <p>Quantity: {{ item.quantity }}</p>
          <button @click="removeFromCart(item.productId)">Remove</button>
        </li>
      </ul>
      <p>Total: {{ totalPrice }}</p>
      <button @click="checkout">Checkout</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  setup() {
    const cartItems = ref([]);

    const fetchCartItems = async () => {
      const response = await fetch('http://localhost:3000/cart/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        cartItems.value = data;  // 直接使用後端返回的數據
      } else {
        console.error('Unexpected data format:', data);
      }
    };

    const removeFromCart = async (productId) => {
      const response = await fetch('http://localhost:3000/cart/del', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        cartItems.value = cartItems.value.filter(item => item.productId !== productId);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    };

    const checkout = async () => {
      const response = await fetch('http://localhost:3000/cart/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        alert('Checkout successful');
        cartItems.value = [];
      } else {
        const data = await response.json();
        alert(`Checkout failed: ${data.error}`);
      }
    };

    const totalPrice = computed(() => {
      return cartItems.value.reduce((total, item) => total + item.Product.price * item.quantity, 0);
    });

    onMounted(fetchCartItems);

    return {
      cartItems,
      removeFromCart,
      checkout,
      totalPrice,
    };
  },
};
</script>
