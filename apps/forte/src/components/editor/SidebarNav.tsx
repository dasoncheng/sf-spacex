import { defineComponent, ref, watch, nextTick } from "vue";
import {
  Layers,
  PaintBucket,
  Settings,
  Layout,
  Image as ImageIcon,
  Film,
} from "lucide-vue-next";

export const SidebarNav = defineComponent({
  name: "SidebarNav",
  props: {
    activeSidebarPanel: {
      type: String,
      required: true,
    },
    showSettingsPanel: {
      type: Boolean,
      default: false,
    },
    currentMode: {
      type: String,
      default: "gif",
    },
  },
  emits: ["switchPanel", "toggleSettings", "switchMode"],
  setup(props, { emit }) {
    const settingsPanelRef = ref<HTMLElement | null>(null);
    const settingsButtonRef = ref<HTMLElement | null>(null);

    const handleSwitchPanel = (panel: "layers" | "backgrounds") => {
      emit("switchPanel", panel);
    };

    const handleToggleSettings = () => {
      emit("toggleSettings");
    };

    const handleSwitchMode = (mode: "gif" | "layout" | "preview") => {
      emit("switchMode", mode);
    };

    // Handle clicks outside the settings panel
    const handleOutsideSettingsClick = (e: MouseEvent) => {
      if (
        settingsPanelRef.value &&
        !settingsPanelRef.value.contains(e.target as Node) &&
        settingsButtonRef.value &&
        !settingsButtonRef.value.contains(e.target as Node)
      ) {
        emit("toggleSettings");
      }
    };

    // Add event listener when settings panel is shown
    watch(
      () => props.showSettingsPanel,
      (value) => {
        if (value) {
          nextTick(() => {
            document.addEventListener("click", handleOutsideSettingsClick);
          });
        } else {
          document.removeEventListener("click", handleOutsideSettingsClick);
        }
      }
    );

    return () => (
      <div class="w-12 flex flex-col bg-zinc-900/60">
        <div
          class={`flex justify-center py-3 cursor-pointer transition-colors hover:bg-zinc-800/50 border-l-2 ${
            props.activeSidebarPanel === "layers"
              ? "border-l-blue-500 bg-zinc-900/30"
              : "border-l-transparent"
          }`}
          onClick={() => handleSwitchPanel("layers")}
          title="文件"
        >
          <Layers
            class={`h-5 w-5 ${
              props.activeSidebarPanel === "layers"
                ? "text-blue-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          />
        </div>
        <div
          class={`flex justify-center py-3 cursor-pointer transition-colors hover:bg-zinc-800/50 border-l-2 ${
            props.activeSidebarPanel === "backgrounds"
              ? "border-l-blue-500 bg-zinc-900/30"
              : "border-l-transparent"
          }`}
          onClick={() => handleSwitchPanel("backgrounds")}
          title="背景"
        >
          <PaintBucket
            class={`h-5 w-5 ${
              props.activeSidebarPanel === "backgrounds"
                ? "text-blue-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          />
        </div>

        {/* Add settings button at the bottom of sidebar */}
        <div class="mt-auto">
          <div
            ref={settingsButtonRef}
            class={`flex justify-center py-3 cursor-pointer transition-colors hover:bg-zinc-800/50 border-l-2 ${
              props.showSettingsPanel
                ? "border-l-blue-500 bg-zinc-900/30"
                : "border-l-transparent"
            }`}
            onClick={handleToggleSettings}
            title="设置"
          >
            <Settings
              class={`h-5 w-5 ${
                props.showSettingsPanel
                  ? "text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            />
          </div>

          {/* Settings panel for mode switching */}
          {props.showSettingsPanel && (
            <div
              ref={settingsPanelRef}
              class="absolute bottom-10 left-12 w-56 rounded border border-zinc-700/50 bg-zinc-900/95 p-3 shadow-lg backdrop-blur-sm z-20"
            >
              <div class="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-300">
                模式
              </div>
              <div class="space-y-1.5">
                <button
                  class={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center ${
                    props.currentMode === "gif"
                      ? "bg-blue-600/20 text-blue-400"
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  onClick={() => handleSwitchMode("gif")}
                >
                  <Film class="h-3.5 w-3.5 mr-2" />
                  GIF 录制模式
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});
