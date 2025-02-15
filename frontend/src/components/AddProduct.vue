<template>
  <div class="add-product-container">
    <h2>{{ $t("AddProduct.Title") }}</h2>
    <form @submit.prevent="addProduct">
      <div class="form-group">
        <label for="name">{{ $t("AddProduct.ProductName") }}</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="category">{{ $t("AddProduct.Categories") }}</label>
        <input type="text" id="category" v-model="category" required />
      </div>
      <div class="form-group">
        <label for="desc">{{ $t("AddProduct.Description") }}</label>
        <input type="text" id="desc" v-model="desc" />
      </div>
      <div class="form-group">
        <label for="price">{{ $t("AddProduct.Price") }}</label>
        <input type="number" id="price" v-model="price" required />
      </div>
      <div class="form-group">
        <label for="imageUrl">{{ $t("AddProduct.ImageURL") }}</label>
        <input type="text" id="imageUrl" v-model="imageUrl" />
      </div>
      <button type="submit" class="submit-button">{{ $t("AddProduct.Add") }}</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
    const name = ref('');
    const category = ref('');
    const desc = ref('');
    const price = ref('');
    const imageUrl = ref('');

    const addProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/product/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            name: name.value,
            category: category.value,
            desc: desc.value,
            price: price.value,
            imageUrl: imageUrl.value,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('Product added successfully');
          name.value = '';
          category.value = '';
          desc.value = '';
          price.value = '';
          imageUrl.value = '';
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    return {
      name,
      category,
      desc,
      price,
      imageUrl,
      addProduct,
    };
  },
};
</script>

<style scoped>
.add-product-container {
  max-width: 600px;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>