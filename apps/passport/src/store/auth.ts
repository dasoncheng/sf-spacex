import { usersAuth } from "@/services/auth";
import type { AccountInfo, Login, User } from "@/types/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const showLoginModal = ref(false);
  const currentUser = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // 初始化认证状态
  const initAuth = () => {
    const account = localStorage.getItem("account");
    if (account) {
      try {
        const parsedAccount = JSON.parse(account) as AccountInfo;
        currentUser.value = parsedAccount.user;
        isAuthenticated.value = true;
      } catch (error) {
        console.error("Failed to parse account data:", error);
        localStorage.removeItem("account");
      }
    }
  };

  // 显示登录弹窗
  const showLogin = () => {
    showLoginModal.value = true;
  };

  // 隐藏登录弹窗
  const hideLogin = () => {
    showLoginModal.value = false;
  };

  // 登录方法
  const login = async (credentials: Login) => {
    try {
      const account = await usersAuth.login(credentials);
      localStorage.setItem("account", JSON.stringify(account));
      currentUser.value = account.user;
      isAuthenticated.value = true;
      hideLogin();
      console.log("登录成功");
      window.location.reload();
    } catch (error) {
      console.error("登录失败:", error);
      throw error;
    }
  };

  // 登出方法
  const logout = () => {
    localStorage.removeItem("account");
    currentUser.value = null;
    isAuthenticated.value = false;
  };

  // 初始化认证状态
  initAuth();

  return {
    showLoginModal,
    currentUser,
    isAuthenticated,
    showLogin,
    hideLogin,
    login,
    logout,
  };
});
