import { defineComponent } from "vue";
import { LotteryStatus } from "../stores/lottery";
import { useSettingsStore } from "../stores/settings";
import { useLotteryStore } from "../stores/lottery";

interface LotteryMainStatusMessageProps {
  status: LotteryStatus;
}

export const LotteryMainStatusMessage =
  defineComponent<LotteryMainStatusMessageProps>({
    name: "LotteryMainStatusMessage",
    props: {
      status: {
        type: String as () => LotteryStatus,
        required: true,
      },
    },
    setup(props) {
      const lottery = useLotteryStore();
      const settings = useSettingsStore();

      return () => {
        switch (props.status) {
          case LotteryStatus.NotConfigured:
            return (
              <div class="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                请先进行抽奖配置，点击右上方“抽奖准备”配置直播间ID
              </div>
            );
          case LotteryStatus.ReadyToCharge:
            return (
              <div class="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                准备就绪，请开始充电
              </div>
            );
          case LotteryStatus.Charging:
            return (
              <div class="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                {settings.settings.commandEnabled
                  ? `抽奖充电中，口令: ${lottery.state.word}`
                  : "没有抽奖口号，发言即可无条件参与抽奖!"}
              </div>
            );
          case LotteryStatus.ReadyToDraw:
            return (
              <div class="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                充电完成，可以开始抽奖
              </div>
            );
          case LotteryStatus.Drawn:
            return (
              <div class="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                本轮抽奖已完成
              </div>
            );
          default:
            return (
              <div class="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                抽奖系统
              </div>
            );
        }
      };
    },
  });
