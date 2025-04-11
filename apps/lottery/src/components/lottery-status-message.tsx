import { defineComponent } from "vue";
import { useLotteryStore, LotteryStatus } from "../stores/lottery";
import { useSettingsStore } from "../stores/settings";

interface LotteryStatusMessageProps {
  status: LotteryStatus;
}

export const LotteryStatusMessage = defineComponent<LotteryStatusMessageProps>({
  name: "LotteryStatusMessage",
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
        case LotteryStatus.ReadyToCharge:
          return (
            <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              点击'开始充电'收集观众信息
            </div>
          );

        case LotteryStatus.Charging:
          return (
            <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              尊享区: {lottery.vip_audiences.length}人 | 福利区:{" "}
              {lottery.regular_audiences.length}人
            </div>
          );

        case LotteryStatus.ReadyToDraw:
          const minRequired = settings.settings.minParticipants;
          const isVipReady = lottery.vip_audiences.length >= minRequired;
          const isRegularReady =
            lottery.regular_audiences.length >= minRequired;

          if (!isVipReady && !isRegularReady) {
            return (
              <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                尊享区人数不足{minRequired}人({lottery.vip_audiences.length}
                )，福利区人数不足{minRequired}人(
                {lottery.regular_audiences.length})，无法开奖
              </div>
            );
          } else if (!isVipReady && isRegularReady) {
            return (
              <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                尊享区人数不足{minRequired}人({lottery.vip_audiences.length}
                )，仅福利区开奖
              </div>
            );
          } else if (isVipReady && !isRegularReady) {
            return (
              <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                福利区人数不足{minRequired}人({lottery.regular_audiences.length}
                )，仅尊享区开奖
              </div>
            );
          } else {
            return (
              <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                尊享区: {lottery.vip_audiences.length}人 | 福利区:{" "}
                {lottery.regular_audiences.length}人
              </div>
            );
          }

        case LotteryStatus.Drawn:
          return (
            <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              点击'开始充电'开启下一轮抽奖
            </div>
          );

        default:
          return (
            <div class="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              尊享专区
            </div>
          );
      }
    };
  },
});
