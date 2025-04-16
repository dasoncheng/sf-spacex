import { defineComponent, ref } from "vue";

export const Activation = defineComponent({
  name: "Activation",
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  emits: ["cancel"],
  setup(props, { emit }) {
    const licenseKey = ref("");
    const error = ref("");

    const handleSubmitActive = async () => {
      if (!licenseKey.value) {
        error.value = "激活码不能为空";
        return;
      }
      try {
        await props.onSubmit(licenseKey.value);
        emit("cancel");
      } catch (err: any) {
        error.value = err.response.data.message || "Failed to active";
      } finally {
      }
    };

    return () => (
      <>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 w-[90%] max-w-md relative">
            <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
              激活
            </h2>

            {error.value && (
              <div class="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {error.value}
              </div>
            )}

            <form onSubmit={() => handleSubmitActive()} class="space-y-4">
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
                  onClick={() => emit("cancel")}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  },
});
