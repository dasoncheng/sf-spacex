import { defineComponent } from "vue";
import { X } from "lucide-vue-next";
import { useSettingsStore } from "../stores/settings";

export const LotterySettings = defineComponent({
  name: "LotterySettings",
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore();

    const closeSettings = () => {
      emit("close");
    };

    return () => {
      if (!props.show) return null;
      return (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">抽奖系统设置</h2>
              <button
                class="rounded-full p-1 hover:bg-gray-100 transition-colors"
                onClick={closeSettings}
              >
                <X class="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div class="space-y-4">
              {/* 开启口令设置 */}
              <div class="border-b pb-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-700">
                      开启口令抽奖
                    </h3>
                    <p class="text-xs text-gray-500">
                      开启后需要发送正确口令才能参与抽奖
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsStore.settings.commandEnabled}
                      onChange={(e) =>
                        (settingsStore.settings.commandEnabled = (
                          e.target as HTMLInputElement
                        ).checked)
                      }
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* 最低开奖人数 */}
              <div class="border-b pb-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">
                  最低开奖人数
                </h3>
                <p class="text-xs text-gray-500 mb-2">
                  参与人数低于设定值时不开奖，并自动转入下一轮
                </p>
                <div class="flex items-center">
                  <button
                    class="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    onClick={settingsStore.decrementMinParticipants}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={settingsStore.settings.minParticipants}
                    onInput={(e) =>
                      (settingsStore.settings.minParticipants = Number(
                        (e.target as HTMLInputElement).value
                      ))
                    }
                    class="w-16 h-8 mx-2 text-center border border-gray-300 rounded"
                    min="1"
                  />
                  <button
                    class="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    onClick={settingsStore.incrementMinParticipants}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 抽奖模式 */}
              <div class="border-b pb-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">抽奖模式</h3>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="fixed"
                      checked={settingsStore.settings.drawMode === "fixed"}
                      onChange={() =>
                        (settingsStore.settings.drawMode = "fixed")
                      }
                      class="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span class="text-sm text-gray-700">
                      固定模式 - 每次从对应奖区抽取固定人数
                    </span>
                  </label>

                  {settingsStore.settings.drawMode === "fixed" && (
                    <div class="pl-6">
                      <div class="flex items-center mt-1">
                        <span class="text-xs text-gray-600 mr-2">
                          抽取人数:
                        </span>
                        <button
                          class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                          onClick={settingsStore.decrementWinnerCount}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={settingsStore.settings.winnersCount}
                          onInput={(e) =>
                            (settingsStore.settings.winnersCount = Number(
                              (e.target as HTMLInputElement).value
                            ))
                          }
                          class="w-12 h-6 mx-1 text-center border border-gray-300 rounded text-sm"
                          min="1"
                        />
                        <button
                          class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                          onClick={settingsStore.incrementWinnerCount}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="ratio"
                      checked={settingsStore.settings.drawMode === "ratio"}
                      onChange={() =>
                        (settingsStore.settings.drawMode = "ratio")
                      }
                      class="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span class="text-sm text-gray-700">
                      比例模式 - 对应奖区按参与人数比例抽取
                    </span>
                  </label>

                  {settingsStore.settings.drawMode === "ratio" && (
                    <div class="pl-6">
                      <div class="flex items-center mt-1">
                        <span class="text-xs text-gray-600 mr-2">每</span>
                        <button
                          class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                          onClick={settingsStore.decrementRatio}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={settingsStore.settings.drawRatio}
                          onInput={(e) =>
                            (settingsStore.settings.drawRatio = Number(
                              (e.target as HTMLInputElement).value
                            ))
                          }
                          class="w-12 h-6 mx-1 text-center border border-gray-300 rounded text-sm"
                          min="1"
                        />
                        <button
                          class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-xs"
                          onClick={settingsStore.incrementRatio}
                        >
                          +
                        </button>
                        <span class="text-xs text-gray-600 ml-2">
                          人抽取一个
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 充电时间 */}
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">
                  充电时间 (秒)
                </h3>
                <div class="flex items-center">
                  <input
                    type="range"
                    value={settingsStore.settings.chargingTime}
                    onChange={(e) =>
                      (settingsStore.settings.chargingTime = Number(
                        (e.target as HTMLInputElement).value
                      ))
                    }
                    min="10"
                    max="180"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span class="w-12 text-center text-sm ml-3">
                    {settingsStore.settings.chargingTime}
                  </span>
                </div>
              </div>

              {/* 按钮 */}
              <div class="flex justify-end space-x-2 pt-4">
                <button
                  class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => {
                    settingsStore.saveSettings();
                    closeSettings();
                  }}
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});
