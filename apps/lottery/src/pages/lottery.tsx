import { defineComponent, ref, watch, onBeforeUnmount } from "vue";
import { LotterySettings } from "../components/lottery-settings";
import { LotteryPreparation } from "../components/lottery-preparation";
import { LotteryHelp } from "../components/lottery-help";
import { LotteryStatusIndicator } from "../components/lottery-status-indicator";
import { LotteryMainStatusMessage } from "../components/lottery-main-status-message";
import { InteractionsList } from "../components/interactions-list";
import { WinnersList } from "../components/winners-list";
import { VipAudienceList } from "../components/vip-audience-list";
import { RegularAudienceList } from "../components/regular-audience-list";
import { NameScrollEffect } from "../components/name-scroll-effect";
import { useLotteryStore, LotteryStatus } from "../stores/lottery";
import { useSettingsStore } from "../stores/settings";
import { LotteryMessageVip } from "../components/lottery-message-vip";
import { LotteryMessageRegular } from "../components/lottery-message-regular";

export const Lottery = defineComponent({
  name: "Lottery",
  setup() {
    const lottery = useLotteryStore();
    const settings = useSettingsStore();
    const countdown = ref(settings.settings.chargingTime);

    // Timer for countdown
    let countdownTimer: number | null = null;

    const resetCountdown = () => {
      countdown.value = settings.settings.chargingTime;
      if (countdownTimer) {
        window.clearInterval(countdownTimer);
        countdownTimer = null;
      }
    };

    const startCountdown = () => {
      resetCountdown();
      countdownTimer = window.setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          resetCountdown();
          if (lottery.state.is_charging) {
            lottery.stopCharging();
          }
        }
      }, 1000);
    };

    // Start/stop countdown when charging state changes
    watch(
      () => lottery.state.is_charging,
      (isCharging) => {
        if (isCharging) {
          startCountdown();
        } else {
          resetCountdown();
        }
      }
    );

    // Cleanup on component unmount
    onBeforeUnmount(() => {
      if (countdownTimer) {
        window.clearInterval(countdownTimer);
      }
    });

    // Modal visibility state
    const showSettings = ref(false);
    const showPreparation = ref(false);
    const showHelp = ref(false);

    return () => (
      <div class="relative flex flex-col bg-gradient-to-b from-white to-yellow-50 p-2 md:p-4 min-h-screen">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-1 text-sm font-medium text-orange-800">
            直播间号: <span class="font-bold">{lottery.state.live_no}</span>
          </div>
          <div class="flex gap-2">
            <button
              class="rounded-full px-3 py-1 border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300 hover:shadow-sm transition-all duration-200"
              onClick={() => (showPreparation.value = true)}
            >
              抽奖准备
            </button>
            <button
              class="rounded-full px-3 py-1 border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300 hover:shadow-sm transition-all duration-200"
              onClick={() => (showSettings.value = true)}
            >
              设置
            </button>
            <button
              class="rounded-full px-3 py-1 border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300 hover:shadow-sm transition-all duration-200"
              onClick={() => (showHelp.value = true)}
            >
              帮助
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4 flex-grow">
          {/* 主抽奖区 */}
          <div class="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
            <div class="relative flex flex-col items-center justify-center border-2 border-yellow-200 bg-gradient-to-b from-white to-yellow-50 p-4 rounded-md shadow-sm h-[calc(60vh-80px)] min-h-[320px]">
              <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-100 opacity-30"></div>
              <div class="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-pink-100 opacity-30"></div>
              <div class="h-120px">
                <div class="mb-3">
                  <LotteryMainStatusMessage status={lottery.status} />
                </div>
                <LotteryMessageVip status={lottery.status} class="mb-1" />
                <LotteryMessageRegular status={lottery.status} />
              </div>

              <div class="mt-6 flex w-full justify-between gap-4">
                <button
                  class={`group relative flex-1 gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-md font-medium text-white transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-md py-1 ${
                    lottery.status === LotteryStatus.NotConfigured
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={lottery.toggleCharging}
                  disabled={lottery.status === LotteryStatus.NotConfigured}
                >
                  <span class="relative z-10 flex items-center justify-center gap-2 w-full">
                    {lottery.state.is_charging ? "停止充电" : "开始充电"}
                  </span>
                  <span
                    class={`absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 transition-transform duration-500 ease-in-out ${
                      lottery.state.is_charging
                        ? "translate-x-0"
                        : "translate-x-full"
                    }`}
                  ></span>
                </button>

                <button
                  class={[
                    "group relative flex-1 gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-md font-medium text-white transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-md py-1",
                    {
                      "opacity-50 cursor-not-allowed": lottery.canNotDrawing,
                      "animate-pulse-slow":
                        lottery.status === LotteryStatus.ReadyToDraw,
                    },
                  ]}
                  onClick={lottery.drawWinners}
                  disabled={lottery.canNotDrawing}
                >
                  <span class="relative z-10 flex items-center justify-center gap-2 w-full">
                    {lottery.state.is_drawing ? (
                      <>
                        <svg
                          class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        正在抽奖...
                      </>
                    ) : (
                      <>开始抽奖</>
                    )}
                    <span class="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></span>
                  </span>
                  <span
                    class={`absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 opacity-0 transition-opacity duration-300 ${
                      lottery.status === LotteryStatus.ReadyToDraw
                        ? "group-hover:opacity-100"
                        : ""
                    }`}
                  ></span>
                  {lottery.status === LotteryStatus.ReadyToDraw && (
                    <span class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.4),transparent_75%)] animate-pulse-slow"></span>
                  )}
                </button>
              </div>

              {/* 只在充电状态显示倒计时 */}
              {lottery.status === LotteryStatus.Charging ? (
                <div class="mt-4 text-center text-lg font-medium">
                  充电倒计时:
                  <span class="text-red-500 font-bold animate-pulse ml-2">
                    {countdown.value}秒
                  </span>
                </div>
              ) : (
                <div class="mt-4">
                  <LotteryStatusIndicator status={lottery.status} />
                </div>
              )}

              <div class="mt-4 rounded-md p-3 border border-orange-100 text-center text-14px">
                <div class="mb-2">
                  <p class="text-amber-700 font-medium">
                    Tips:
                    充电期间，观众通过参与互动加入抽奖池，充电途中请勿退出直播间，退出直播间则
                    <span class="text-red-500 font-bold">失去抽奖资格</span>
                  </p>
                </div>
                <div>
                  <p class="text-orange-700 font-medium">
                    进行发言、点赞、分享等互动的观众将进入
                    <span class="text-blue-500 font-medium mr-2">福利专区</span>
                    赠送非免费礼物可进入
                    <span class="text-orange-600 font-bold">尊享专区</span>
                    进行抽奖，礼物越多，
                    <span class="text-orange-600 font-bold">中奖概率越大</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 互动信息和中奖信息并列 */}
            <div class="grid grid-cols-1 md:grid-cols-2 flex-grow gap-4">
              {/* 使用互动信息组件 */}
              <InteractionsList />

              {/* 使用中奖信息组件 */}
              <WinnersList />
            </div>
          </div>

          {/* 右侧参与者区域 */}
          <div class="lg:col-span-1 flex flex-col h-full">
            <div class="grid grid-cols-1 gap-4 h-full">
              {/* 使用尊享专区组件 */}
              <VipAudienceList />

              {/* 使用福利专区组件 */}
              <RegularAudienceList />
            </div>
          </div>
        </div>

        <div class="mt-4 text-center text-xs text-gray-500">
          <p>© 2025 抽奖直播系统 | 技术支持: 盛锋网络</p>
        </div>

        {/* Settings Modal */}
        <LotterySettings
          show={showSettings.value}
          onClose={() => (showSettings.value = false)}
        />

        {/* Preparation Modal */}
        <LotteryPreparation
          show={showPreparation.value}
          v-model:liveNo={lottery.state.live_no}
          onClose={() => (showPreparation.value = false)}
        />

        {/* Help Modal */}
        <LotteryHelp
          show={showHelp.value}
          onClose={() => (showHelp.value = false)}
        />
      </div>
    );
  },
});
