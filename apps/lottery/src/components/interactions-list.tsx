import { defineComponent, ref, computed } from "vue";
import { MessageType, useLotteryStore } from "../stores/lottery";
import { formatTime } from "../utils/time";

export const InteractionsList = defineComponent({
  name: "InteractionsList",
  setup() {
    const lottery = useLotteryStore();
    const interactionsRef = ref<HTMLElement | null>(null);

    // Create a reversed computed property of interactions
    const reversedInteractions = computed(() => {
      return [...lottery.state.interactions].reverse();
    });

    return () => (
      <div class="flex flex-col h-full">
        <div class="flex items-center gap-2 rounded-t-md bg-gradient-to-r from-blue-500 to-indigo-500 p-2 font-medium text-white">
          <h3>互动信息</h3>
        </div>
        <div
          ref={interactionsRef}
          class="overflow-y-auto border-2 border-blue-200 p-2 flex-grow rounded-b-md h-[calc(40vh-100px)] min-h-[220px]"
        >
          {lottery.state.interactions.length === 0 ? (
            <div class="text-center text-slate-500 py-3 text-sm">
              暂无互动信息
            </div>
          ) : (
            reversedInteractions.value.map((item, index) => {
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
                      送了 <span class="font-medium">{item.gift_name}</span>{" "}
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
    );
  },
});
