import { defineComponent, ref, reactive, PropType } from "vue";
import {
  ResourceConfig,
  ActType,
  ActAction,
  ActOutput,
  ActDir,
} from "../models/act";
import { LayerConfig } from "./layer-config";
import { LayerFilter } from "./layer-filter";
import { ACTS } from "../utils/act";

export const Console = defineComponent({
  name: "Console",
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    currentConfig: {
      type: Object as () => ResourceConfig,
      required: true,
      // default: () => ({
      //   Type: ActType.None,
      //   Actions: [],
      // }),
    },
    filter: {
      type: Object as PropType<{
        acts: ActOutput[];
        dirs: ActDir[];
      }>,
      required: true,
    },
  },
  emits: ["close", "configUpdate", "update:filter"],
  setup(props, { emit }) {
    // State to track which tab is active
    const activeTab = ref<"config" | "preview">("config");
    // Height of the console panel
    const consoleHeight = ref(250);

    // Configuration state based on props
    const configModel = reactive<ResourceConfig>(props.currentConfig);

    // Update resource type
    const updateResourceType = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      configModel.Type = parseInt(target.value) as ActType;
      configModel.Actions = Array.from(
        ACTS.get(configModel.Type)?.Actions ?? []
      );
      emit("configUpdate", { ...configModel });
    };

    // Add a new empty action
    const addAction = () => {
      configModel.Actions.push({
        Start: 0,
        Frame: 1,
        Skip: 0,
        Output: "",
        Dir: 0,
      });
    };

    // Remove an action by index
    const removeAction = (index: number) => {
      configModel.Actions.splice(index, 1);
    };

    // Update the configuration and emit the update
    const updateConfig = () => {
      emit("configUpdate", { ...configModel });
    };

    // Switch between tabs
    const switchTab = (tab: "config" | "preview") => {
      activeTab.value = tab;
    };

    return () => (
      <div
        class={`absolute px-3 bottom-0 left-0 right-0 border-t border-zinc-800/80 bg-zinc-900/95 text-zinc-300 transition-all duration-200 z-10 ${
          !props.visible ? "hidden" : ""
        }`}
        style={{
          height: `${consoleHeight.value}px`,
        }}
      >
        {/* Tab bar - VSCode style with pseudo-element border */}
        <div class="flex items-center text-xs select-none">
          <div class="flex h-full gap-3">
            <button
              class={`h-full py-1 flex items-center relative transition-colors ${
                activeTab.value === "config"
                  ? "bg-zinc-900/80 text-zinc-200 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-zinc-200"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
              onClick={() => switchTab("config")}
            >
              配置
            </button>
            <button
              class={`h-full py-1 flex items-center relative transition-colors ${
                activeTab.value === "preview"
                  ? "bg-zinc-900/80 text-zinc-200 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-zinc-200"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
              onClick={() => switchTab("preview")}
            >
              过滤
            </button>
          </div>

          {/* Resource Type Selector - Only visible in config tab */}
          {activeTab.value === "config" && (
            <div class="ml-auto flex items-center mr-2">
              <span class="text-xs text-zinc-400 mr-2">资源类型:</span>
              <select
                class="bg-zinc-800 border border-zinc-700 rounded px-2 py-[2px] text-xs text-zinc-300"
                value={configModel.Type}
                onChange={updateResourceType}
              >
                <option value={ActType.None}>未知</option>
                <option value={ActType.Player}>玩家</option>
                <option value={ActType.Monster}>怪物</option>
                <option value={ActType.Effect}>特效</option>
                <option value={ActType.Weapon}>武器</option>
                <option value={ActType.Hair}>发型</option>
                <option value={ActType.Wing}>翅膀</option>
                <option value={ActType.Shield}>盾牌</option>
                <option value={ActType.NPC}>NPC</option>
              </select>
            </div>
          )}

          <div class={activeTab.value === "config" ? "" : "ml-auto"}>
            <button
              class="p-[1px] rounded-[3px] flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70"
              onClick={() => emit("close")}
              title="关闭面板"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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

        {/* Content area - both panels are always in DOM but only active one is visible */}
        <div class="relative h-[calc(100%-22px)] bg-zinc-900/90">
          {/* Config panel */}
          <div
            class="absolute inset-0 overflow-auto transition-opacity duration-150"
            style={{
              opacity: activeTab.value === "config" ? 1 : 0,
              visibility: activeTab.value === "config" ? "visible" : "hidden",
            }}
          >
            <LayerConfig
              config={configModel}
              onUpdate={updateConfig}
              onAddAction={addAction}
              onRemoveAction={removeAction}
            />
          </div>

          {/* Preview panel */}
          <div
            class="absolute inset-0overflow-auto transition-opacity duration-150"
            style={{
              opacity: activeTab.value === "preview" ? 1 : 0,
              visibility: activeTab.value === "preview" ? "visible" : "hidden",
            }}
          >
            <LayerFilter
              config={configModel}
              filter={props.filter}
              onUpdate:filter={(val) => {
                emit("update:filter", val);
              }}
            />
          </div>
        </div>
      </div>
    );
  },
});
