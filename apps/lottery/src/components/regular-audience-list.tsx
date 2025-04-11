import { defineComponent, ref, computed } from "vue";
import { useLotteryStore } from "../stores/lottery";

export const RegularAudienceList = defineComponent({
  name: "RegularAudienceList",
  setup() {
    const lottery = useLotteryStore();
    const regularAudiencesRef = ref<HTMLElement | null>(null);

    // Create a reversed computed property of regular audiences
    const reversedRegularAudiences = computed(() => {
      return [...lottery.regular_audiences].reverse();
    });

    return () => (
      <div class="flex flex-col flex-1 min-h-0 shadow-sm">
        <div class="rounded-t-md bg-gradient-to-r from-blue-400 to-indigo-500 p-2 font-medium text-white">
          <div class="flex items-center gap-2">
            <h3>福利专区</h3>
          </div>
        </div>
        <div class="flex-grow border-2 border-blue-200 p-2 rounded-b-md">
          <div class="mb-2 grid grid-cols-12 border-b border-blue-100 pb-1 text-sm font-medium text-blue-800">
            <div class="col-span-4">序号</div>
            <div class="col-span-8">昵称</div>
          </div>

          <div
            ref={regularAudiencesRef}
            class="overflow-y-auto h-[calc(50vh-180px)] min-h-[180px]"
          >
            {reversedRegularAudiences.value.length === 0 ? (
              <div class="text-center text-slate-500 py-2">暂无用户</div>
            ) : (
              reversedRegularAudiences.value.map((user) => (
                <div
                  key={user.id}
                  class="grid grid-cols-12 border-b border-orange-50 py-1 text-sm transition-colors duration-200 hover:bg-orange-50"
                >
                  <div class="col-span-4 font-medium text-orange-600 text-ellipsis overflow-hidden">
                    {user.id}
                  </div>
                  <div class="col-span-8 truncate text-ellipsis overflow-hidden">
                    {user.nickname}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
});
