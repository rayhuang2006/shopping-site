import { createRouter, createWebHistory } from 'vue-router';
import ProductList from '../components/ProductList.vue';
import UserLogin from '../components/UserLogin.vue';
import ShoppingCart from '../components/ShoppingCart.vue';
import AddProduct from '../components/AddProduct.vue';
import NotFound from '../components/NotFound.vue';

const routes = [
  { path: '/', redirect: '/products/list' },
  { path: '/products/list', component: ProductList },
  { path: '/products/category/:category', component: ProductList },
  { path: '/login', component: UserLogin },
  { path: '/cart', component: ShoppingCart },
  { path: '/products/add', component: AddProduct },
  { path: '/:pathMatch(.*)*', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;