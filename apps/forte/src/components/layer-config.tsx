import { defineComponent, PropType, ref, watch } from "vue";
import { ResourceConfig, ActAction } from "../models/act";

export const LayerConfig = defineComponent({
  props: {
    config: {
      type: Object as PropType<ResourceConfig>,
      required: true,
    },
  },
  emits: ["update", "addAction", "removeAction"],
  setup(props, { emit }) {
    // 计算开始帧
    const calculateStartFrame = (index: number) => {
      return props.config.Actions.slice(0, index).reduce(
        (sum, action) => sum + action.Frame + action.Skip,
        0
      );
    };

    return () => (
      <div class="my-3 border border-zinc-700/50 rounded-[2px] overflow-hidden">
        {/* 表头 */}
        <div class="grid grid-cols-11 bg-zinc-800/80 text-xs text-zinc-400 font-medium">
          <div class="col-span-2 p-1 border-r border-zinc-700/30 text-center">
            开始帧
          </div>
          <div class="col-span-2 p-1 border-r border-zinc-700/30 text-center">
            帧数
          </div>
          <div class="col-span-2 p-1 border-r border-zinc-700/30 text-center">
            跳帧
          </div>
          <div class="col-span-1 p-1 border-r border-zinc-700/30 text-center">
            方向
          </div>
          <div class="col-span-2 p-1 border-r border-zinc-700/30 text-center">
            名称
          </div>
          <div class="col-span-2 p-1 text-center">操作</div>
        </div>

        {/* 表格内容 - 可滚动 */}
        <div class="max-h-[180px] overflow-y-auto bg-zinc-900/30">
          {props.config.Actions.map((action, index) => (
            <div
              key={index}
              class={`grid grid-cols-11 text-xs ${
                index % 2 === 0 ? "bg-zinc-800/10" : "bg-zinc-800/30"
              } hover:bg-zinc-700/30`}
            >
              <div class="col-span-2 p-0.5 border-r border-zinc-700/30">
                <input
                  type="number"
                  class="w-full bg-zinc-700/30 border border-zinc-600/30 rounded px-1 py-0.5 text-xs text-zinc-300"
                  value={calculateStartFrame(index)}
                  readonly
                />
              </div>
              <div class="col-span-2 p-0.5 border-r border-zinc-700/30">
                <input
                  type="number"
                  class="w-full bg-zinc-700/30 border border-zinc-600/30 rounded px-1 py-0.5 text-xs text-zinc-300"
                  min="1"
                  v-model={action.Frame}
                />
              </div>
              <div class="col-span-2 p-0.5 border-r border-zinc-700/30">
                <input
                  type="number"
                  class="w-full bg-zinc-700/30 border border-zinc-600/30 rounded px-1 py-0.5 text-xs text-zinc-300"
                  v-model={action.Skip}
                  min="0"
                />
              </div>
              <div class="col-span-1 p-0.5 border-r border-zinc-700/30">
                <input
                  type="number"
                  class="w-full bg-zinc-700/30 border border-zinc-600/30 rounded px-1 py-0.5 text-xs text-zinc-300"
                  v-model={action.Dir}
                  min="0"
                />
              </div>
              <div class="col-span-2 p-0.5 border-r border-zinc-700/30">
                <input
                  type="text"
                  class="w-full bg-zinc-700/30 border border-zinc-600/30 rounded px-1 py-0.5 text-xs text-zinc-300"
                  v-model={action.Output}
                  placeholder="动作名称"
                />
              </div>
              <div class="col-span-2 p-1 flex justify-center items-center gap-1">
                <button
                  class="text-red-400 hover:text-red-300"
                  onClick={() => emit("removeAction", index)}
                  title="删除动作"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* 空状态 */}
          {props.config.Actions.length === 0 && (
            <div class="text-center py-4 text-zinc-500 text-xs italic">
              没有动作配置，请添加动作或选择预设类型
            </div>
          )}
        </div>
      </div>
    );
  },
});
