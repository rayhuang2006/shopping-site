<template>
  <div>
    <h2>{{ isRegistering ? 'Register' : 'Login' }}</h2>
    <form @submit.prevent="isRegistering ? register() : login()">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">{{ isRegistering ? 'Register' : 'Login' }}</button>
    </form>
    <button @click="toggleForm">{{ isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register' }}</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../eventBus';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const isRegistering = ref(false);

    const toggleForm = () => {
      isRegistering.value = !isRegistering.value;
    };

    const login = async () => {
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', username.value); 
          localStorage.setItem('role', data.role); // 存儲 role
          isLoggedIn.value = true; 
          router.push('/products/list');
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const register = async () => {
      try {
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful');
          isRegistering.value = false; 
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    return {
      username,
      password,
      isRegistering,
      toggleForm,
      login,
      register,
    };
  },
};
</script>