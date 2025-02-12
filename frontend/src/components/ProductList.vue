<template>
  <div>
    <h2>Product List</h2>
    <div>
      <h3>Categories</h3>
      <ul>
        <li v-for="category in categories" :key="category" @click="goToCategory(category)">
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
        <button v-if="role === 'admin'" @click="deleteProduct(product.id)">Delete</button>
        <button v-else @click="addToCart(product.id)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const products = ref([]);
    const categories = ref([]);
    const selectedCategory = ref('');
    const route = useRoute();
    const router = useRouter();
    const role = ref(localStorage.getItem('role') || '');

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/product/list', {
          credentials: 'include',
        });
        const data = await response.json();
        products.value = data;
        categories.value = ['All', ...new Set(data.map(product => product.category))];
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

    const deleteProduct = async (productId) => {
      const response = await fetch(`http://localhost:3000/product/delete/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        products.value = products.value.filter(product => product.id !== productId);
      } else {
        alert(data.error);
      }
    };

    const goToCategory = (category) => {
      if (category === 'All') {
        router.push('/products/list');
      } else {
        router.push(`/products/category/${category}`);
      }
    };

    onMounted(fetchProducts);

    const filteredProducts = computed(() => {
      const category = route.params.category || selectedCategory.value;
      if (!category || category === 'All') {
        return products.value;
      }
      return products.value.filter(product => product.category === category);
    });

    return {
      products,
      categories,
      selectedCategory,
      filterByCategory,
      addToCart,
      deleteProduct,
      filteredProducts,
      goToCategory,
      role,
    };
  },
};
</script>