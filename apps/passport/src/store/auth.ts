import { usersAuth } from "@/services/auth";
import type { AccountInfo, Login } from "@/types/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const showLoginModal = ref(false);
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
      const account: AccountInfo = await usersAuth.login(credentials);
      localStorage.setItem("account", JSON.stringify(account));
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
  };

  return {
    showLoginModal,
    showLogin,
    hideLogin,
    login,
    logout,
  };
});
