import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import { LoginModal } from "./components/LoginModal";
import { RegisterModal } from "./components/RegisterModal";
import { useAuthStore } from "@/store/auth";
import type { Login } from "./types/api";

export const App = defineComponent({
  setup() {
    const authStore = useAuthStore();

    const handleLogin = async (credentials: Login) => {
      try {
        await authStore.login(credentials);
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      }
    };

    return () => (
      <div>
        <RouterView />

        <LoginModal
          isOpen={authStore.showLoginModal}
          onClose={authStore.hideLogin}
          onSubmit={handleLogin}
          onShowRegister={authStore.showRegister}
        />

        <RegisterModal
          isOpen={authStore.showRegisterModal}
          onClose={authStore.hideRegister}
          onRegisterSuccess={authStore.handleRegisterSuccess}
          onShowLogin={authStore.showLogin}
        />
      </div>
    );
  },
});
