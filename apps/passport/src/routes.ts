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
import { RolesList } from "./pages/roles/RolesList";
import { RoleDetail } from "./pages/roles/RoleDetail";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    redirect: "/users",
    children: [
      { path: "users", component: UsersList, meta: { label: "用户列表" } },
      { path: "users/:id", component: UserDetail },
      {
        path: "licenses",
        component: LicensesList,
        meta: { label: "卡密列表" },
      },
      { path: "licenses/:id", component: LicenseDetail },
      {
        path: "applications",
        component: ApplicationsList,
        meta: { label: "应用列表" },
      },
      { path: "applications/:id", component: ApplicationDetail },
      { path: "roles", component: RolesList, meta: { label: "角色列表" } },
      { path: "roles/:id", component: RoleDetail },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/users" }, // Catch-all route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export { router };
