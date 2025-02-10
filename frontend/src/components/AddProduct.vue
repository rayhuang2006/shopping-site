<template>
  <div>
    <h2>Add Product</h2>
    <form @submit.prevent="addProduct">
      <div>
        <label for="name">Product Name:</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div>
        <label for="category">Category:</label>
        <input type="text" id="category" v-model="category" required />
      </div>
      <div>
        <label for="desc">Description:</label>
        <input type="text" id="desc" v-model="desc" />
      </div>
      <div>
        <label for="price">Price:</label>
        <input type="number" id="price" v-model="price" required />
      </div>
      <div>
        <label for="imageUrl">Image URL:</label>
        <input type="text" id="imageUrl" v-model="imageUrl" />
      </div>
      <button type="submit">Add Product</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const name = ref('');
    const category = ref('');
    const desc = ref('');
    const price = ref('');
    const imageUrl = ref('');

    const addProduct = async () => {
      try {
        const response = await fetch('http://localhost:3000/product/add', {
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