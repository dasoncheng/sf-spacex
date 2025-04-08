import { createRouter, createWebHistory,type RouteRecordRaw } from "vue-router";
import { AccountsList } from "./pages/accounts/AccountsList";
import { KeysList } from "./pages/keys/KeysList";
import { ApplicationsList } from "./pages/applications/ApplicationsList";


const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/accounts' },
  { path: '/accounts', component: AccountsList },
  { path: '/keys', component: KeysList },
  { path: '/applications', component: ApplicationsList },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export { router };
