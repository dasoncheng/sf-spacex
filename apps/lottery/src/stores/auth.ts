import { defineStore } from "pinia";
import { ref } from "vue";
import {
  ceateActivation,
  getActivationsStatus,
  loginByEmail,
  registerByEmail,
} from "../services/auth";
import { AccountInfo, User } from "../models/auth";
import { DeviceIdentificationCache } from "../utils/activate";
import { environment } from "../utils/environment";

export const useAuthStore = defineStore("auth", () => {
  const showLoginDialog = ref(false);
  const showActiveDialog = ref(false);
  const currentUser = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const error = ref("");
  const activationStatus = ref(false);

  // 初始化认证状态
  const initAuth = () => {
    const account = localStorage.getItem("account");
    activationStatus.value = JSON.parse(
      localStorage.getItem("activation") ?? "false"
    );
    if (account) {
      try {
        const parsedAccount = JSON.parse(account) as AccountInfo;
        currentUser.value = parsedAccount.user;
        isAuthenticated.value = true;
        showLoginDialog.value = false;
        showActiveDialog.value = !activationStatus.value;
      } catch (error) {
        console.error("Failed to parse account data:", error);
      }
    } else {
      showLoginDialog.value = true;
      localStorage.removeItem("account");
      localStorage.removeItem("activation");
    }
  };

  // 登录
  const login = async (email: string, password: string) => {
    error.value = "";
    loginByEmail({ email, password })
      .then((account) => {
        localStorage.setItem("account", JSON.stringify(account));
        currentUser.value = account.user;
        isAuthenticated.value = true;
        getActivationsStatus({
          fingerprint: DeviceIdentificationCache.hardware_id,
          applicationId: environment.applicationId,
        }).then((active) => {
          if (!active.isActive) {
            showActiveDialog.value = true;
            showLoginDialog.value = false;
            localStorage.setItem("activation", "false");
          } else {
            error.value = "";
            showActiveDialog.value = false;
            showLoginDialog.value = false;
            localStorage.setItem("activation", "true");
          }
        });
      })
      .catch((err) => {
        error.value = err.response.data.message || "登录失败";
        throw err;
      });
  };
  // 注册
  const register = async (email: string, password: string) => {
    try {
      await registerByEmail({ email, password });
    } catch (err: any) {
      error.value = err.response.data.message || "注册失败";
      throw err;
    }
  };
  // 激活
  const activation = async (licenseKey: string) => {
    try {
      await ceateActivation({
        applicationId: environment.applicationId,
        fingerprint: DeviceIdentificationCache.hardware_id,
        licenseKey: licenseKey,
      });
      localStorage.setItem("activation", "true");
      showActiveDialog.value = false;
      showLoginDialog.value = false;
    } catch (err: any) {
      error.value = err.response.data.message || "激活失败";
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
    localStorage.removeItem("activation");
    currentUser.value = null;
    isAuthenticated.value = false;
    showLoginDialog.value = true;
  }

  // 初始化认证状态
  initAuth();

  return {
    showLoginDialog,
    showActiveDialog,
    currentUser,
    isAuthenticated,
    error,
    activationStatus,
    openLoginDialog,
    closeLoginDialog,
    register,
    login,
    logout,
    activation,
  };
});
