import { defineComponent, ref, nextTick, PropType } from "vue";
import { MoreVertical, Eye, EyeOff, Trash2 } from "lucide-vue-next";
import { LayerItem, LayerList } from "../layer-list";

export const LayerPanel = defineComponent({
  name: "LayerPanel",
  props: {
    layers: {
      type: Array as PropType<LayerItem[]>,
      required: true,
    },
    selectedLayerId: {
      type: String,
      default: "",
    },
    areAllLayersVisible: {
      type: Boolean,
      default: true,
    },
  },
  emits: [
    "deleteLayer",
    "selectLayer",
    "toggleVisibility",
    "clearAllLayers",
    "toggleAllLayersVisibility",
  ],
  setup(props, { emit }) {
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
            文件
          </h2>
          <div class="relative">
            <button
              ref={moreButtonRef}
              class="p-0.5 rounded-sm inline-flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              onClick={toggleContextMenu}
              title="文件操作"
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
                {/* Visibility controls */}
                <div class="px-1 py-1">
                  <button
                    class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs text-zinc-300 outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      emit("toggleAllLayersVisibility");
                      showContextMenu.value = false;
                    }}
                    role="menuitem"
                    disabled={props.layers.length === 0}
                  >
                    {props.areAllLayersVisible ? (
                      <>
                        <EyeOff class="mr-2 h-3.5 w-3.5" />
                        <span>隐藏所有图层</span>
                      </>
                    ) : (
                      <>
                        <Eye class="mr-2 h-3.5 w-3.5" />
                        <span>显示所有图层</span>
                      </>
                    )}
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
                      if (props.layers.length > 0) {
                        emit("clearAllLayers");
                      }
                      showContextMenu.value = false;
                    }}
                    role="menuitem"
                    disabled={props.layers.length === 0}
                  >
                    <Trash2 class="mr-2 h-3.5 w-3.5" />
                    <span>清空所有图层</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div class="p-1.5 flex-1 overflow-y-auto">
          <LayerList
            layers={props.layers}
            selectedLayerId={props.selectedLayerId}
            onDeleteLayer={(id) => emit("deleteLayer", id)}
            onSelectLayer={(id) => emit("selectLayer", id)}
            onToggleVisibility={(id) => emit("toggleVisibility", id)}
            onClearAllLayers={() => emit("clearAllLayers")}
          />
        </div>
      </div>
    );
  },
});
