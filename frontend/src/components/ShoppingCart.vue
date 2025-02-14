<template>
  <div class="shopping-cart">
    <h2>Shopping Cart</h2>
    <div v-if="cartItems.length === 0">
      <p>Your cart is empty.</p>
    </div>
    <div v-else>
      <ul class="cart-items">
        <li v-for="item in cartItems" :key="item.productId" class="cart-item">
          <h3>{{ item.Product.name }}</h3>
          <p>Price: {{ item.Product.price }}</p>
          <p>Quantity: {{ item.quantity }}</p>
          <button @click="removeFromCart(item.productId)">Remove</button>
        </li>
      </ul>
      <p class="total-price">Total: {{ totalPrice }}</p>
      <button class="checkout-button" @click="checkout">Checkout</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  setup() {
    const cartItems = ref([]);
    const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

    const fetchCartItems = async () => {
      const response = await fetch(`${API_BASE_URL}/cart/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        cartItems.value = data;  
      } else {
        console.error('Unexpected data format:', data);
      }
    };

    const removeFromCart = async (productId) => {
      const response = await fetch(`${API_BASE_URL}/cart/del`, {
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
      const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
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

<style scoped>
.shopping-cart {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.cart-items {
  list-style-type: none;
  padding: 0;
}

.cart-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.cart-item h3 {
  margin: 0;
}

.cart-item p {
  margin: 5px 0;
}

.cart-item button {
  padding: 5px 10px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cart-item button:hover {
  background-color: #c82333;
}

.total-price {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
}

.checkout-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.checkout-button:hover {
  background-color: #0056b3;
}
</style>