import { defineComponent, ref, nextTick, PropType } from "vue";
import { MoreVertical, ImageIcon, Trash2 } from "lucide-vue-next";
import {
  BackgroundPreset,
  BackgroundPresets,
  CustomBackground,
} from "../background-presets";

export const BackgroundPanel = defineComponent({
  name: "BackgroundPanel",
  props: {
    selectedBackground: {
      type: String,
      required: true,
    },
    customBackgrounds: {
      type: Array as PropType<CustomBackground[]>,
      default: () => [],
    },
  },
  emits: [
    "updateSelectedBackground",
    "addCustomBackground",
    "removeCustomBackground",
    "clearAllCustomBackgrounds",
  ],
  setup(props, { emit }) {
    // Background presets data
    const backgroundPresets = [
      {
        id: "special",
        name: "紫蓝",
        color: "from-purple-500/30 to-blue-500/30",
      },
      {
        id: "slow",
        name: "翠绿",
        color: "from-green-500/30 to-teal-500/30",
      },
      {
        id: "equipment",
        name: "橙黄",
        color: "from-amber-500/30 to-orange-500/30",
      },
      {
        id: "no-comment",
        name: "暗灰",
        color: "from-zinc-500/30 to-zinc-600/30",
      },
      {
        id: "time0",
        name: "粉红",
        color: "from-pink-500/30 to-rose-500/30",
      },
      {
        id: "time1",
        name: "青蓝",
        color: "from-cyan-500/30 to-blue-500/30",
      },
      {
        id: "equip1",
        name: "金黄",
        color: "from-amber-500/30 to-yellow-500/30",
      },
      {
        id: "single",
        name: "绿色",
        color: "from-emerald-500/30 to-green-500/30",
      },
    ];

    // Context menu state
    const showContextMenu = ref(false);
    const contextMenuRef = ref<HTMLElement | null>(null);
    const moreButtonRef = ref<HTMLElement | null>(null);

    // Toggle context menu
    const toggleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      showContextMenu.value = !showContextMenu.value;

      if (showContextMenu.value) {
        nextTick(() => {
          document.addEventListener("click", handleOutsideClick);
          document.addEventListener("keydown", handleEscapeKey);
        });
      } else {
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleEscapeKey);
      }
    };

    // Handle clicks outside the context menu
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        contextMenuRef.value &&
        !contextMenuRef.value.contains(e.target as Node) &&
        moreButtonRef.value &&
        !moreButtonRef.value.contains(e.target as Node)
      ) {
        showContextMenu.value = false;
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleEscapeKey);
      }
    };

    // Handle escape key for accessibility
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showContextMenu.value) {
        showContextMenu.value = false;
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleEscapeKey);
      }
    };

    return () => (
      <div class="flex flex-col h-full">
        <div class="p-2 border-b border-zinc-800/70 flex items-center justify-between">
          <h2 class="text-xs font-medium uppercase tracking-wider text-zinc-300">
            背景
          </h2>
          <div class="relative">
            <button
              ref={moreButtonRef}
              class="p-0.5 rounded-sm inline-flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              onClick={toggleContextMenu}
              title="背景操作"
              aria-haspopup="true"
              aria-expanded={showContextMenu.value}
            >
              <MoreVertical class="h-3.5 w-3.5" />
            </button>

            {/* Context menu */}
            {showContextMenu.value && (
              <div
                ref={contextMenuRef}
                class="absolute right-0 top-full mt-1 z-50 min-w-[12rem] overflow-hidden rounded-md border border-zinc-700/50 bg-zinc-900 p-1 shadow-md animate-in fade-in-80 slide-in-from-top-1"
                style={{ transformOrigin: "top right" }}
                role="menu"
                aria-orientation="vertical"
              >
                {/* Background management options */}
                <div class="px-1 py-1">
                  <button
                    class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs text-zinc-300 outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open file picker for adding custom background
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const id = `custom-${Date.now()}`;
                            emit("addCustomBackground", {
                              id,
                              name: file.name,
                              url: e.target?.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                      showContextMenu.value = false;
                    }}
                    role="menuitem"
                  >
                    <ImageIcon class="mr-2 h-3.5 w-3.5" />
                    <span>添加本地背景图片</span>
                  </button>
                </div>

                {/* Separator */}
                <div class="h-px my-1 bg-zinc-800/50"></div>

                {/* Destructive actions */}
                <div class="px-1 py-1">
                  <button
                    class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs text-zinc-300 outline-none transition-colors hover:bg-red-900/50 hover:text-red-200 focus:bg-red-900/50 focus:text-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      emit("clearAllCustomBackgrounds");
                      showContextMenu.value = false;
                    }}
                    role="menuitem"
                    disabled={props.customBackgrounds.length === 0}
                  >
                    <Trash2 class="mr-2 h-3.5 w-3.5" />
                    <span>清空所有自定义背景</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div class="p-1.5 flex-1 overflow-y-auto">
          <BackgroundPresets
            backgroundPresets={backgroundPresets}
            customBackgrounds={props.customBackgrounds}
            selectedBackground={props.selectedBackground}
            onUpdate:selectedBackground={(value) =>
              emit("updateSelectedBackground", value)
            }
            onAddCustomBackground={(bg) => emit("addCustomBackground", bg)}
            onRemoveCustomBackground={(id) =>
              emit("removeCustomBackground", id)
            }
          />
        </div>
      </div>
    );
  },
});
