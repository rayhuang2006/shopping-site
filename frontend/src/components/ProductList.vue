<template>
  <div>
    <h2>Product List</h2>
    <div>
      <h3>Categories</h3>
      <ul>
        <li v-for="category in categories" :key="category" @click="filterByCategory(category)">
          {{ category }}
        </li>
      </ul>
    </div>
    <div>
      <div v-for="product in filteredProducts" :key="product.id">
        <h3>{{ product.name }}</h3>
        <p>{{ product.desc }}</p>
        <p>{{ product.price }}</p>
        <img :src="product.imageUrl" alt="Product Image" />
        <button @click="addToCart(product.id)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  setup() {
    const products = ref([]);
    const categories = ref([]);
    const selectedCategory = ref('');

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/product/list', {
          credentials: 'include',
        });
        const data = await response.json();
        products.value = data;
        categories.value = [...new Set(data.map(product => product.category))];
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    const filterByCategory = (category) => {
      selectedCategory.value = category;
    };

    const addToCart = async (productId) => {
      const response = await fetch('http://localhost:3000/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
      }
    };

    onMounted(fetchProducts);

    const filteredProducts = computed(() => {
      if (!selectedCategory.value) {
        return products.value;
      }
      return products.value.filter(product => product.category === selectedCategory.value);
    });

    return {
      products,
      categories,
      selectedCategory,
      filterByCategory,
      addToCart,
      filteredProducts,
    };
  },
};
</script>