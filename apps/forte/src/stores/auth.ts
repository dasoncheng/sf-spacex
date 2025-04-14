import { defineStore } from "pinia";
import { ref } from "vue";
import { loginByEmail, registerByEmail } from "../services/auth";

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface User {
  Id: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
}
export interface Login {
  email: string;
  password: string;
}

export interface AccountInfo {
  user: User;
  token: string;
}

export const useAuthStore = defineStore("auth", () => {
  const showLoginDialog = ref(false);
  const showRegisterModal = ref(false);
  const currentUser = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const error = ref("");

  // 初始化认证状态
  const initAuth = () => {
    const account = localStorage.getItem("account");
    if (account) {
      try {
        const parsedAccount = JSON.parse(account) as AccountInfo;
        currentUser.value = parsedAccount.user;
        isAuthenticated.value = true;
        showLoginDialog.value = false;
      } catch (error) {
        console.error("Failed to parse account data:", error);
        localStorage.removeItem("account");
      }
    } else {
      showLoginDialog.value = true;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      error.value = "";
      const account = await loginByEmail({ email, password });
      localStorage.setItem("account", JSON.stringify(account));
      currentUser.value = account.user;
      isAuthenticated.value = true;
      closeLoginDialog();
    } catch (err: any) {
      error.value = err.response.data.message || "登录失败";
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await registerByEmail({ email, password });
    } catch (err: any) {
      error.value = err.response.data.message || "注册失败";
      throw err;
    }
  };

  function openLoginDialog() {
    showLoginDialog.value = true;
  }

  function closeLoginDialog() {
    showLoginDialog.value = false;
  }

  function logout() {
    error.value = "";
    localStorage.removeItem("account");
    currentUser.value = null;
    isAuthenticated.value = false;
    showLoginDialog.value = true;
  }

  // 初始化认证状态
  initAuth();

  return {
    showLoginDialog,
    showRegisterModal,
    currentUser,
    isAuthenticated,
    error,
    openLoginDialog,
    closeLoginDialog,
    register,
    login,
    logout,
  };
});
