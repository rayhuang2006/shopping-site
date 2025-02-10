<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>

    <h2>Register</h2>
    <form @submit.prevent="register">
      <div>
        <label for="regUsername">Username:</label>
        <input type="text" id="regUsername" v-model="regUsername" required />
      </div>
      <div>
        <label for="regPassword">Password:</label>
        <input type="password" id="regPassword" v-model="regPassword" required />
      </div>
      <button type="submit">Register</button>
    </form>
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
    const regUsername = ref('');
    const regPassword = ref('');

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
          isLoggedIn.value = true; // 更新 isLoggedIn 狀態
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
          body: JSON.stringify({ username: regUsername.value, password: regPassword.value }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful');
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
      regUsername,
      regPassword,
      login,
      register,
    };
  },
};
</script>