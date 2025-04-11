import { defineComponent, ref, computed } from "vue";
import { AudienceStatus, useLotteryStore } from "../stores/lottery";

export const WinnersList = defineComponent({
  name: "WinnersList",
  setup() {
    const lottery = useLotteryStore();
    const winnersRef = ref<HTMLElement | null>(null);

    // Create a reversed computed property of winners
    const reversedWinners = computed(() => {
      return [...lottery.state.winner].reverse();
    });

    return () => (
      <div class="flex flex-col h-full">
        <div class="flex items-center gap-2 rounded-t-md bg-gradient-to-r from-amber-500 to-orange-500 p-2 font-medium text-white">
          <h3>中奖信息</h3>
        </div>
        <div
          ref={winnersRef}
          class="overflow-y-auto border-2 border-orange-200 p-2 text-sm flex-grow rounded-b-md h-[calc(40vh-100px)] min-h-[220px]"
        >
          {lottery.state.winner.length === 0 ? (
            <div class="text-center text-slate-500 py-2">暂无中奖信息</div>
          ) : (
            reversedWinners.value.map((user) => (
              <div
                key={user.id}
                class="mb-1 border-b border-orange-50 pb-1 transition-colors duration-200 hover:bg-orange-50"
              >
                <div>
                  <span
                    class={`mr-1 font-medium ${
                      user.status === AudienceStatus.VIP
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {user.status === AudienceStatus.VIP
                      ? "尊享专区"
                      : "福利专区"}
                  </span>
                  <span class="mr-1 text-xs text-gray-500">({user.time})</span>
                </div>
                <div>
                  <span class="mr-1">用户:</span>
                  <span class="font-medium">{user.nickname},</span>
                  <span class="mr-1">ID:</span>
                  <span>{user.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
});
