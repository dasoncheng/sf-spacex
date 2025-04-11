import { computed, defineComponent } from "vue";
import {
  useLotteryStore,
  LotteryStatus,
  AudienceStatus,
} from "../stores/lottery";
import { useSettingsStore } from "../stores/settings";
import { NameScrollEffect } from "./name-scroll-effect";

interface LotteryMessageRegularProps {
  status: LotteryStatus;
}

export const LotteryMessageRegular =
  defineComponent<LotteryMessageRegularProps>({
    name: "LotteryMessageRegular",
    props: {
      status: {
        type: String as () => LotteryStatus,
        required: true,
      },
    },
    setup(props) {
      const lottery = useLotteryStore();
      const settings = useSettingsStore();
      const isRegularReady = computed(() => {
        return (
          lottery.regular_audiences.length >= settings.settings.minParticipants
        );
      });

      return () => {
        switch (props.status) {
          case LotteryStatus.ReadyToCharge:
            return (
              <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                福利专区：等待充电
              </div>
            );

          case LotteryStatus.Charging:
            return (
              <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                福利区: {lottery.regular_audiences.length}人
              </div>
            );

          case LotteryStatus.ReadyToDraw:
            if (!isRegularReady.value) {
              return (
                <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  福利区人数不足{settings.settings.minParticipants}人(
                  {lottery.regular_audiences.length})，暂不开奖
                </div>
              );
            } else {
              if (lottery.state.is_drawing) {
                return (
                  <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                    福利区:{" "}
                    <NameScrollEffect
                      names={[
                        ...lottery.regular_audiences.map((a) => a.nickname),
                      ]}
                      isActive={lottery.state.is_drawing}
                    />
                  </div>
                );
              }

              return (
                <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  福利区: {lottery.regular_audiences.length}人，等待开奖
                </div>
              );
            }

          case LotteryStatus.Drawn:
            if (isRegularReady.value) {
              return (
                <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  福利区获奖观众：
                  {
                    lottery.state.winner
                      .filter((item) => item.status === AudienceStatus.Regular)
                      .reverse()
                      .at(0)?.nickname
                  }
                </div>
              );
            } else {
              return (
                <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  福利区人数不足{settings.settings.minParticipants}人(
                  {lottery.regular_audiences.length})，转到下一轮抽奖
                </div>
              );
            }

          default:
            return (
              <div class="text-center text-26px font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                福利专区幸运观众待产生
              </div>
            );
        }
      };
    },
  });
