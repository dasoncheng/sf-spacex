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
    redirect: "/users",
    children: [
      { path: "users", component: UsersList, meta: { label: '用户列表' } },
      { path: "users/:id", component: UserDetail },
      { path: "licenses", component: LicensesList, meta: { label: '许可证列表' } },
      { path: "licenses/:id", component: LicenseDetail },
      { path: "applications", component: ApplicationsList, meta: { label: '应用列表' } },
      { path: "applications/:id", component: ApplicationDetail },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/users' }, // Catch-all route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export { router };
