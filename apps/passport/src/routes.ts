import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { UsersList } from "./pages/users/UsersList";
import { LicensesList } from "./pages/licenses/LicensesList";
import { ApplicationsList } from "./pages/applications/ApplicationsList";
import { UserDetail } from "./pages/users/UserDetail";
import { ApplicationDetail } from "./pages/applications/ApplicationDetail";
import { LicenseDetail } from "./pages/licenses/LicenseDetail";
import { MainLayout } from "./layouts/MainLayout";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "/users", component: UsersList },
      { path: "/users/:id", component: UserDetail },
      { path: "/licenses", component: LicensesList },
      { path: "/licenses/:id", component: LicenseDetail },
      { path: "/applications", component: ApplicationsList },
      { path: "/applications/:id", component: ApplicationDetail },
    ],
  },
  { path: "/", redirect: "/users" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export { router };
