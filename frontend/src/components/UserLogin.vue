<template>
  <div class="login-container">
    <h2>{{ isRegistering ? 'Register' : 'Login' }}</h2>
    <form @submit.prevent="isRegistering ? register() : login()">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button">{{ isRegistering ? 'Register' : 'Login' }}</button>
    </form>
    <button @click="toggleForm" class="toggle-button">{{ isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register' }}</button>
    <div id="googleButton" class="google-button"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { isLoggedIn } from '../eventBus';

const CLIENT_ID = "873334368949-2fh00u2lq1v5ks9ae96bqdgmnq29opp6.apps.googleusercontent.com";

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
          localStorage.setItem('role', data.role); 
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

    const onLogin = async (res) => {
      try {
        const response = await fetch('http://localhost:3000/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:8080' },
          body: JSON.stringify(res),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.name);
          localStorage.setItem('role', 'user'); 
          isLoggedIn.value = true;
          router.push('/products/list');
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    onMounted(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: onLogin,
          cancel_on_tap_outside: true,
          context: 'signin',
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleButton'),
          { theme: 'outline', size: 'large' }
        );

        window.google.accounts.id.prompt();
      } else {
        console.error("Google API client library not loaded!");
      }
    });

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

<style scoped>
.login-container {
  max-width: 400px;
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

.toggle-button {
  width: 100%;
  padding: 10px;
  background-color: #6c757d;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.toggle-button:hover {
  background-color: #5a6268;
}

.google-button {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>