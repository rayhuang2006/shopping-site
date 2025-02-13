<template>
  <div class="product-list">
    <div class="sidebar">
      <h3>Categories</h3>
      <ul>
        <li v-for="category in categories" :key="category" @click="goToCategory(category)">
          {{ category }}
        </li>
      </ul>
    </div>
    <div class="main-content">
      <h2>Product List</h2>
      <div class="search">
        <input type="text" v-model="searchQuery" placeholder="Search products..." />
      </div>
      <div class="products">
        <div v-for="product in filteredProducts" :key="product.id" class="product">
          <h3>{{ product.name }}</h3>
          <p>{{ product.desc }}</p>
          <img :src="product.imageUrl" alt="Product Image" />
          <div class="product-footer">
            <p class="product-price">{{ product.price }}</p>
            <button v-if="role === 'admin'" @click="deleteProduct(product.id)">Delete</button>
            <button v-else @click="addToCart(product.id)">Add to Cart</button>
          </div>
        </div>
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
    const searchQuery = ref('');
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
      let filtered = products.value;

      if (category && category !== 'All') {
        filtered = filtered.filter(product => product.category === category);
      }

      if (searchQuery.value) {
        filtered = filtered.filter(product => product.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
      }

      return filtered;
    });

    return {
      products,
      categories,
      selectedCategory,
      searchQuery,
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

<style scoped>
.product-list {
  display: flex;
  padding: 20px;
}

.sidebar {
  width: 200px;
  margin-right: 20px;
}

.sidebar h3 {
  margin-bottom: 10px;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 10px;
  cursor: pointer;
  color: #007bff;
}

.sidebar li:hover {
  text-decoration: underline;
}

.main-content {
  flex: 1;
}

.search {
  margin-bottom: 20px;
}

.search input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.products {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.product {
  border: 1px solid #ddd;
  padding: 20px;
  width: calc(33.333% - 40px);
  box-sizing: border-box;
  text-align: center;
}

.product img {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.product button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}

.product button:hover {
  background-color: #0056b3;
}
</style>