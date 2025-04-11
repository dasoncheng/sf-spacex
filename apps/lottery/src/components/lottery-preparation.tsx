import { defineComponent, ref } from "vue";
import { X, LoaderCircle } from "lucide-vue-next";
import { getRoomDetail } from "../services/996box";
import { useLotteryStore } from "../stores/lottery";
import { useRoomStore } from "../stores/room";

export const LotteryPreparation = defineComponent({
  name: "LotteryPreparation",
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const lottery = useLotteryStore();
    const roomStore = useRoomStore();

    // Room ID input state
    const error = ref("");

    // Fetch room information
    const fetchRoomInfo = async () => {
      if (!lottery.state.live_no) {
        error.value = "请输入直播间ID";
        return;
      }

      error.value = "";
      roomStore.status = "loading";
      roomStore.detail = null;

      try {
        // Call the actual API service
        const response = await getRoomDetail({
          live_no: lottery.state.live_no,
        });

        if (response.data) {
          roomStore.detail = response.data;
          roomStore.status = "success";
          lottery.initialization(roomStore.detail.hx_room_id);
        } else {
          throw new Error("获取直播间信息失败");
        }
      } catch (e) {
        roomStore.status = "error";
        error.value = "获取直播间信息失败，请重试";
        console.error("Failed to fetch room details:", e);
      }
    };

    // Close without saving
    const closePreparation = () => {
      emit("close");
    };
    return () => {
      if (!props.show) return null;
      return (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">抽奖准备</h2>
              <button
                class="rounded-full p-1 hover:bg-gray-100 transition-colors"
                onClick={closePreparation}
              >
                <X class="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div class="space-y-6">
              {/* 直播间ID设置 */}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  直播间ID
                </label>
                <div class="flex items-center">
                  <input
                    v-model={lottery.state.live_no}
                    type="text"
                    placeholder="请输入直播间ID"
                    class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={fetchRoomInfo}
                    class="ml-2 px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm transition-colors"
                    disabled={roomStore.status === "loading"}
                  >
                    {roomStore.status === "loading" ? (
                      <LoaderCircle class="h-4 w-4 animate-spin" />
                    ) : (
                      <span>获取</span>
                    )}
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  输入直播间ID并点击获取按钮加载直播间信息
                </p>
              </div>

              {/* 直播间信息展示 */}
              {roomStore.detail && (
                <div class="bg-orange-50 rounded-md p-3 border border-orange-100">
                  <h3 class="text-sm font-medium text-orange-800 mb-2">
                    直播间信息
                  </h3>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="text-gray-600">直播间ID:</div>
                    <div class="font-medium text-gray-800">
                      {roomStore.detail.live_no}
                    </div>

                    <div class="text-gray-600">主播:</div>
                    <div class="font-medium text-gray-800">
                      {roomStore.detail.nickname}
                    </div>

                    <div class="text-gray-600">粉丝人数:</div>
                    <div class="font-medium text-gray-800">
                      {roomStore.detail.fans_num}
                    </div>

                    <div class="text-gray-600">状态:</div>
                    <div
                      class={
                        roomStore.detail.is_living == 1
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {roomStore.detail.is_living == 1 ? "直播中" : "未开播"}
                    </div>
                  </div>
                </div>
              )}

              {/* 错误信息展示 */}
              {error.value && (
                <div class="bg-red-50 rounded-md p-3 border border-red-100">
                  <p class="text-sm text-red-700">{error.value}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };
  },
});
