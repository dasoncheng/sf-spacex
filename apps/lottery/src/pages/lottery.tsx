import { defineComponent, ref, watch, onBeforeUnmount, onMounted } from "vue";
import { Setting, Activation } from "@sf-spacex/applications/widgets";
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
import { useAuthStore } from "../stores/auth";
import { ceateActivation, getActivationsStatus } from "../services/auth";
import { environment } from "../utils/environment";
import { DeviceIdentificationCache } from "../utils/activate";

export const Lottery = defineComponent({
  name: "Lottery",
  setup() {
    const lottery = useLotteryStore();
    const settings = useSettingsStore();
    const authStore = useAuthStore();
    const countdown = ref(settings.settings.chargingTime);
    const showUserMenu = ref(false);
    const showSetting = ref(false);
    const showActive = ref(false);
    const expiresAt = ref<string | null>(null);
    const activatedAt = ref<string | null>(null);

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

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu.value && !target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    // Cleanup on component unmount
    onBeforeUnmount(() => {
      if (countdownTimer) {
        window.clearInterval(countdownTimer);
      }
      document.removeEventListener("click", handleClickOutside);
    });

    // Modal visibility state
    const showSettings = ref(false);
    const showPreparation = ref(false);
    const showHelp = ref(false);

    const setShowUserMenu = (value: boolean) => {
      showUserMenu.value = value;
    };
    const getActivition = async () => {
      const { ExpiresAt, ActivatedAt } = await getActivationsStatus({
        fingerprint: DeviceIdentificationCache.hardware_id,
        applicationId: environment.applicationId,
      });
      expiresAt.value = ExpiresAt;
      activatedAt.value = ActivatedAt;
    };

    const activeSubmit = async (licenseKey: string) => {
      return await ceateActivation({
        applicationId: environment.applicationId,
        fingerprint: DeviceIdentificationCache.hardware_id,
        licenseKey: licenseKey,
      });
    };

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

            {/* 用户按钮 */}
            <div class="relative user-menu-container">
              <button
                class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-200 to-yellow-200 flex items-center justify-center text-orange-700 hover:shadow-md transition-all duration-200 border-2 border-orange-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu.value);
                }}
              >
                <svg
                  class="w-6"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1540"
                  width="200"
                  height="200"
                >
                  <path
                    d="M309.52 494.12c-1.94 0-3.47 0.28-4.67 0.76 1.63-0.49 3.37-0.76 5.16-0.76L309.52 494.12zM845.13 707.52c0.05-0.99 0.18-1.96 0.39-2.9C845.29 705.05 845.17 705.97 845.13 707.52zM880.86 313.29c0.01-0.04 0.01-0.09 0.01-0.13l0-0.46C880.87 312.9 880.87 313.1 880.86 313.29zM845.11 313.23c0 0.04 0 0.08 0.01 0.12-0.01-0.21-0.01-0.43-0.01-0.65L845.11 313.23zM866.673 849.43c-5.03-37.45-16.03-73.61-32.69-107.48-3.26-6.62-6.71-13.13-10.37-19.51-0.01-0.02-0.02-0.04-0.04-0.06-15.86-26.86-35.32-51.8-58-74.06l-0.01-0.01c-4.93-4.84-10.01-9.56-15.24-14.14-37.29-32.68-80.34-56.91-126.25-71.65 8.31-4.6 16.35-9.76 24.07-15.47 8.79-6.48 17.16-13.68 25.03-21.55 41.39-41.39 64.19-96.43 64.19-154.97 0-58.54-22.8-113.58-64.19-154.97-40.64-40.64-94.44-63.35-151.78-64.17-0.91-0.01-1.82-0.02-2.73-0.02-0.91 0-1.82 0.01-2.73 0.02-57.34 0.82-111.14 23.53-151.78 64.17-41.39 41.39-64.19 96.43-64.19 154.97 0 58.54 22.8 113.58 64.19 154.97 7.87 7.87 16.24 15.07 25.03 21.55 7.72 5.71 15.76 10.87 24.07 15.47-45.91 14.74-88.96 38.97-126.25 71.65-5.23 4.58-10.31 9.3-15.24 14.14-22.7 22.28-42.18 47.24-58.05 74.13-3.66 6.38-7.11 12.89-10.37 19.51-16.66 33.87-27.66 70.03-32.69 107.48-1.61 12 6.81 23.03 18.8 24.64 0.99 0.13 1.98 0.2 2.95 0.2 0.89 0 1.76-0.05 2.63-0.16 8.67-1.89 15.67-8.96 17.03-18.25 10.1-69.32 43.14-132.31 90.63-180.28 56.36-56.95 133.07-92.74 215.97-92.88l0.47 0c82.72 0.28 159.25 36.04 215.5 92.88 47.49 47.97 80.53 110.96 90.63 180.28 1.36 9.27 8.33 16.33 16.98 18.24 0.02 0 0.03 0.01 0.05 0.01 0.87 0.11 1.74 0.16 2.63 0.16 0.97 0 1.96-0.07 2.95-0.2C859.863 872.46 868.283 861.43 866.673 849.43zM518.193 545.86c-0.44 0-0.88 0-1.32-0.01-81.8-0.6-154.73-57.43-174.66-133.66-0.22-0.83-0.44-1.67-0.64-2.51-3.12-12.6-4.78-25.7-4.78-39.15 0-13.45 1.66-26.7 4.78-39.52 0.2-0.86 0.42-1.71 0.64-2.56 20.04-78.14 93.65-140.25 175.98-140.25l0.94 0c82.33 0 155.94 62.11 175.98 140.25 0.22 0.85 0.44 1.7 0.64 2.56 3.12 12.82 4.78 26.07 4.78 39.52 0 13.45-1.66 26.55-4.78 39.15-0.2 0.84-0.42 1.68-0.64 2.51-19.93 76.23-92.86 133.06-174.66 133.66C519.703 545.86 518.953 545.86 518.193 545.86z"
                    fill="#e16531"
                    p-id="1541"
                  ></path>
                </svg>
              </button>
              {showUserMenu.value && (
                <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-50">
                  <div class="py-2 border-b border-gray-100 hover:bg-gray-50">
                    <div
                      class="text-sm font-medium text-gray-900 text-center cursor-pointer  py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        showSetting.value = true;
                        setShowUserMenu(false);
                      }}
                    >
                      {authStore.currentUser?.Email}
                    </div>
                  </div>
                  <div class="py-2 border-b border-gray-100 hover:bg-gray-50">
                    <div
                      class="text-sm font-medium text-gray-900 text-center cursor-pointer  py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        authStore.logout();
                        setShowUserMenu(false);
                      }}
                    >
                      退出登录
                    </div>
                  </div>
                </div>
              )}
              {showSetting.value && (
                <Setting
                  onClose={() => (showSetting.value = false)}
                  user={authStore.currentUser}
                  activation={authStore.activationStatus}
                  onGetActivition={getActivition}
                  expiresAt={expiresAt.value}
                  activatedAt={activatedAt.value}
                  onActive={() => (showActive.value = true)}
                />
              )}

              {showActive.value && (
                <Activation
                  onSubmit={(licenseKey: string) => activeSubmit(licenseKey)}
                  onCancel={() => (showActive.value = false)}
                  onRefresh={() => getActivition()}
                />
              )}
            </div>
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
          <p>© 2025 抽奖直播系统</p>
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
