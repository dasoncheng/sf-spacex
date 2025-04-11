import { defineComponent, ref, watch, nextTick, onMounted } from "vue";
import { MessageType, useLotteryStore } from "../stores/lottery";
import { formatTime } from "../utils/time";
import { DeviceIdentificationCache } from "../utils/activate";

export const LiveLottery = defineComponent({
  name: "LiveLottery",
  setup() {
    const lottery = useLotteryStore();
    // Create refs for all scrollable containers
    const interactionsContainer = ref<HTMLDivElement | null>(null);
    const vipPoolContainer = ref<HTMLDivElement | null>(null);
    const regularPoolContainer = ref<HTMLDivElement | null>(null);

    // Function to scroll a container to its bottom
    const scrollToBottom = (container: HTMLDivElement | null) => {
      if (container) {
        nextTick(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    };

    // Watch for changes in the data arrays and auto-scroll when they change
    watch(
      () => lottery.state.interactions.length,
      (newLength, oldLength) => {
        if (newLength > oldLength) {
          scrollToBottom(interactionsContainer.value);
        }
      }
    );

    watch(
      () => lottery.state.vip_audiences.size,
      (newSize, oldSize) => {
        if (newSize > oldSize) {
          scrollToBottom(vipPoolContainer.value);
        }
      }
    );

    watch(
      () => lottery.state.regular_audiences.size,
      (newSize, oldSize) => {
        if (newSize > oldSize) {
          scrollToBottom(regularPoolContainer.value);
        }
      }
    );

    // Initially scroll all containers to bottom when mounted
    onMounted(async () => {
      scrollToBottom(interactionsContainer.value);
      scrollToBottom(vipPoolContainer.value);
      scrollToBottom(regularPoolContainer.value);
    });

    return () => (
      <div class="container mx-auto p-2 h-screen flex flex-col overflow-hidden">
        {/* 直播间信息输入和操作按钮区域 */}
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
            <input
              v-model={lottery.state.live_no}
              type="text"
              placeholder="请输入直播间号"
              class="flex-[3] px-3 py-1.5 text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div class="flex items-center gap-2 flex-[5] flex-wrap">
              {/* 加载直播间信息按钮 */}
              <button
                onClick={lottery.initialization}
                class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                disabled={
                  !lottery.state.live_no ||
                  lottery.state.is_loading ||
                  lottery.state.is_charging
                }
              >
                {lottery.state.is_loading ? "加载中..." : "加载信息"}
              </button>

              {/* 开始/结束充电按钮 */}
              {!lottery.state.is_charging ? (
                <button
                  onClick={lottery.startCharging}
                  class="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
                  disabled={
                    !lottery.state.is_initialization || !lottery.state.room_id
                  }
                >
                  开始充电
                </button>
              ) : (
                <button
                  onClick={lottery.stopCharging}
                  class="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                >
                  结束充电
                </button>
              )}

              {/* 抽奖按钮 */}
              <button
                onClick={lottery.drawWinners}
                class="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500"
                disabled={
                  lottery.state.is_charging ||
                  lottery.state.is_drawing ||
                  lottery.state.has_drawn ||
                  (lottery.state.vip_audiences.size === 0 &&
                    lottery.state.regular_audiences.size === 0)
                }
              >
                {lottery.state.is_drawing
                  ? "抽奖中..."
                  : lottery.state.has_drawn
                  ? "已抽奖"
                  : "抽取幸运用户"}
              </button>
            </div>
          </div>

          {/* Device ID display */}
          {
            <div class="mt-2 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2">
              设备ID:{DeviceIdentificationCache.hardware_id}
            </div>
          }
        </div>

        {/* 主内容区域 - 填充剩余空间 */}
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden">
          {/* 左侧 - 实时互动 */}
          <div class="col-span-1 md:col-span-6 flex flex-col min-w-0 overflow-hidden">
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex-1 flex flex-col overflow-hidden">
              <h2 class="text-base font-medium mb-2">实时互动信息</h2>
              <div
                ref={interactionsContainer}
                class="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md"
              >
                {lottery.state.interactions.length === 0 ? (
                  <div class="text-center text-slate-500 py-3 text-sm">
                    开始充电后显示实时互动信息
                  </div>
                ) : (
                  lottery.state.interactions.map((item, index) => {
                    // User information display is consistent across all message types
                    const userInfoSection = (
                      <div class="flex items-center gap-1 mb-0.5">
                        <div class="flex-1">
                          <span class="font-medium text-sm bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded-sm">
                            {item.nickname}
                          </span>
                          <span class="text-xs text-slate-500 ml-1">
                            ID: {item.id}
                          </span>
                        </div>
                        <span class="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded-sm">
                          {formatTime(item.time)}
                        </span>
                      </div>
                    );

                    // Different message content based on message type
                    let contentSection;
                    switch (item.type) {
                      case MessageType.Join:
                        contentSection = (
                          <div class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-1 px-2 rounded-sm">
                            加入了直播间
                          </div>
                        );
                        break;
                      case MessageType.Share:
                        contentSection = (
                          <div class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 py-1 px-2 rounded-sm">
                            分享了直播间
                          </div>
                        );
                        break;
                      case MessageType.Follow:
                        contentSection = (
                          <div class="text-xs text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 py-1 px-2 rounded-sm">
                            关注了直播间
                          </div>
                        );
                        break;
                      case MessageType.Gift:
                        contentSection = (
                          <div class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 py-1 px-2 rounded-sm">
                            送了{" "}
                            <span class="font-medium">{item.gift_name}</span>{" "}
                            <img
                              src={item.icon}
                              alt={item.gift_name}
                              class="w-50px h-50px"
                            />{" "}
                            * {item.count}
                          </div>
                        );
                        break;
                      case MessageType.Text:
                        contentSection = (
                          <div class="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-1 px-2 rounded-sm">
                            {item.content}
                          </div>
                        );
                        break;
                      default:
                        contentSection = (
                          <div class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-1 px-2 rounded-sm">
                            其他未处理事件
                          </div>
                        );
                        break;
                    }

                    return (
                      <div
                        key={index}
                        class="py-2 px-2 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        {userInfoSection}
                        {contentSection}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 右侧 - 状态和抽奖 */}
          <div class="col-span-1 md:col-span-6 flex flex-col gap-3 min-w-0 overflow-hidden">
            {/* 合并的抽奖池和观众列表 */}
            <div class="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
              {/* 尊享区 */}
              <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex flex-col overflow-hidden">
                {/* 尊享区标题和状态 */}
                <div class="mb-2 flex-shrink-0">
                  <div class="flex justify-between items-center mb-1">
                    <h2 class="text-base font-medium text-amber-500">尊享区</h2>
                    <div class="text-base font-bold text-amber-500">
                      {lottery.state.vip_audiences.size}
                    </div>
                  </div>
                </div>

                {/* 尊享区用户列表 */}
                <div
                  ref={vipPoolContainer}
                  class="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md text-xs mb-2 min-h-0"
                >
                  {lottery.state.vip_audiences.size === 0 ? (
                    <div class="text-center text-slate-500 py-2">暂无用户</div>
                  ) : (
                    Array.from(lottery.state.vip_audiences.values()).map(
                      (user, index) => (
                        <div
                          key={index}
                          class="px-2 py-1 border-b border-slate-100 dark:border-slate-700 last:border-0"
                        >
                          <div class="font-medium">{user.nickname}</div>
                          <div class="text-slate-500">ID: {user.id}</div>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* 尊享区抽奖结果 */}
                <div class="bg-amber-50 dark:bg-amber-950/30 rounded-md p-2 min-h-[60px] flex items-center justify-center flex-shrink-0">
                  {lottery.state.vip_winner.size > 0 ? (
                    Array.from(lottery.state.vip_winner.values()).map(
                      (user, index) => (
                        <div class="text-center">
                          <div class="text-amber-600 dark:text-amber-400 font-bold text-base">
                            🎉 {user.nickname} 🎉
                          </div>
                          <div class="text-xs text-slate-600 dark:text-slate-400">
                            ID: {user.id}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div class="text-center text-slate-500 text-sm">
                      等待抽取幸运用户
                    </div>
                  )}
                </div>
              </div>

              {/* 福利区 */}
              <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex flex-col overflow-hidden">
                {/* 福利区标题和状态 */}
                <div class="mb-2 flex-shrink-0">
                  <div class="flex justify-between items-center mb-1">
                    <h2 class="text-base font-medium text-blue-500">福利区</h2>
                    <div class="text-base font-bold text-blue-500">
                      {lottery.state.regular_audiences.size}
                    </div>
                  </div>
                </div>

                {/* 福利区用户列表 */}
                <div
                  ref={regularPoolContainer}
                  class="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md text-xs mb-2 min-h-0"
                >
                  {lottery.state.regular_audiences.size === 0 ? (
                    <div class="text-center text-slate-500 py-2">暂无用户</div>
                  ) : (
                    Array.from(lottery.state.regular_audiences.values()).map(
                      (user, index) => (
                        <div
                          key={index}
                          class="px-2 py-1 border-b border-slate-100 dark:border-slate-700 last:border-0"
                        >
                          <div class="font-medium">{user.nickname}</div>
                          <div class="text-slate-500">ID: {user.id}</div>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* 福利区抽奖结果 */}
                <div class="bg-blue-50 dark:bg-blue-950/30 rounded-md p-2 min-h-[60px] flex items-center justify-center flex-shrink-0">
                  {lottery.state.regular_winner.size > 0 ? (
                    Array.from(lottery.state.regular_winner.values()).map(
                      (user, index) => (
                        <div class="text-center">
                          <div class="text-blue-600 dark:text-blue-400 font-bold text-base">
                            🎉 {user.nickname} 🎉
                          </div>
                          <div class="text-xs text-slate-600 dark:text-slate-400">
                            ID: {user.id}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div class="text-center text-slate-500 text-sm">
                      等待抽取幸运用户
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
