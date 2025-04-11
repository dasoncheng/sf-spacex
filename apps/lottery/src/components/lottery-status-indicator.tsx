import { defineComponent } from "vue";
import { LotteryStatus } from "../stores/lottery";

interface LotteryStatusIndicatorProps {
  status: LotteryStatus;
}

export const LotteryStatusIndicator =
  defineComponent<LotteryStatusIndicatorProps>({
    name: "LotteryStatusIndicator",
    props: {
      status: {
        type: String as () => LotteryStatus,
        required: true,
      },
    },
    setup(props) {
      return () => (
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-2 py-2">
            <div
              class={`h-3 w-3 rounded-full ${
                props.status === LotteryStatus.NotConfigured
                  ? "bg-red-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
            <div
              class={`h-3 w-3 rounded-full ${
                props.status === LotteryStatus.ReadyToCharge
                  ? "bg-orange-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
            <div
              class={`h-3 w-3 rounded-full ${
                props.status === LotteryStatus.Charging
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
            <div
              class={`h-3 w-3 rounded-full ${
                props.status === LotteryStatus.ReadyToDraw
                  ? "bg-green-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
            <div
              class={`h-3 w-3 rounded-full ${
                props.status === LotteryStatus.Drawn
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      );
    },
  });
