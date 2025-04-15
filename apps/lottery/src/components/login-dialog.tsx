import { defineComponent, ref } from "vue";
import { useAuthStore } from "../stores/auth";

export const LoginDialog = defineComponent({
  name: "LoginDialog",
  setup() {
    const authStore = useAuthStore();
    const isLogin = ref(true);
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const licenseKey = ref("");

    const handleSubmit = async (e: Event) => {
      e.preventDefault();

      if (!email.value) {
        authStore.error = "请输入邮箱";
        return;
      }
      if (!password.value) {
        authStore.error = "请输入密码";
        return;
      }

      if (!isLogin.value && password.value !== confirmPassword.value) {
        authStore.error = "两次输入的密码不一致";
        return;
      }

      if (isLogin.value) {
        await authStore.login(email.value, password.value);
      } else {
        await authStore.register(email.value, password.value);
        isLogin.value = true;
      }
    };

    const handleSubmitActive = async (e: Event) => {
      e.preventDefault();
      if (!licenseKey.value) {
        authStore.error = "请输入激活码";
        return;
      }

      await authStore.activation(licenseKey.value);
    };

    return () => (
      <div>
        {authStore.showLoginDialog && (
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-[90%] max-w-md relative">
              <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
                {isLogin.value ? "登录" : "注册"}
              </h2>

              {authStore.error && (
                <div class="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {authStore.error}
                </div>
              )}
              <form onSubmit={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm text-gray-700">邮箱</label>
                  <input
                    type="email"
                    v-model={email.value}
                    placeholder="请输入邮箱"
                    class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm text-gray-700">密码</label>
                  <input
                    type="password"
                    v-model={password.value}
                    placeholder="请输入密码"
                    class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {!isLogin.value && (
                  <div class="space-y-2">
                    <label class="text-sm text-gray-700">确认密码</label>
                    <input
                      type="password"
                      v-model={confirmPassword.value}
                      placeholder="请再次输入密码"
                      class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div class="flex gap-4 mt-6">
                  <button
                    type="submit"
                    class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {isLogin.value ? "登录" : "注册"}
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      isLogin.value = !isLogin.value;
                      email.value = "";
                      password.value = "";
                      confirmPassword.value = "";
                      authStore.error = "";
                    }}
                  >
                    {isLogin.value ? "去注册" : "去登录"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {authStore.showActiveDialog && (
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 w-[90%] max-w-md relative">
              <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
                激活
              </h2>

              {authStore.error && (
                <div class="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {authStore.error}
                </div>
              )}
              <form onSubmit={handleSubmitActive} class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm text-gray-700">激活码</label>
                  <input
                    v-model={licenseKey.value}
                    placeholder="请输入激活码"
                    class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div class="flex gap-4 mt-6">
                  <button
                    type="submit"
                    class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    激活
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      authStore.showActiveDialog = false;
                      authStore.showLoginDialog = true;
                      email.value = "";
                      password.value = "";
                      confirmPassword.value = "";
                      authStore.error = "";
                      licenseKey.value = "";
                    }}
                  >
                    去登录
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  },
});
