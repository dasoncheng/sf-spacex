import { defineComponent, PropType } from "vue";
import { Trash2, Eye, EyeOff, X } from "lucide-vue-next";
import { LayerInfo } from "../utils/resource";

export interface LayerItem extends LayerInfo {
  visible: boolean;
  x: number;
  y: number;
}

export const LayerList = defineComponent({
  name: "FrameList",
  props: {
    layers: {
      type: Array as PropType<LayerItem[]>,
      required: true,
    },
    selectedLayerId: {
      type: String,
    },
  },
  emits: ["deleteLayer", "selectLayer", "toggleVisibility", "clearAllLayers"],
  setup(props, { emit }) {
    const handleFrameDelete = (frameId: string, event: Event) => {
      event.stopPropagation();
      emit("deleteLayer", frameId);
    };

    const handleFrameSelect = (frameId: string) => {
      emit("selectLayer", frameId);
    };

    const handleLayerToggleVisibility = (layerId: string, event: Event) => {
      event.stopPropagation();
      emit("toggleVisibility", layerId);
    };

    const handleClearAllLayers = (event: Event) => {
      event.stopPropagation();
      // Only show confirmation if there are layers
      if (props.layers.length > 0) {
        if (confirm("确定要清空所有文件吗？此操作不可撤销。")) {
          emit("clearAllLayers");
        }
      }
    };

    return () => (
      <div class="h-full custom-scrollbar overflow-y-auto">
        <div class="custom-scrollbar h-full overflow-auto">
          <table class="border-collapse w-full">
            <thead>
              <tr>
                <th class="h-7 p-1 text-[10px] font-medium uppercase text-zinc-500 text-left px-2.5">
                  名称
                </th>
                <th class="h-7 p-1 text-[10px] font-medium uppercase text-zinc-500 text-center">
                  帧数
                </th>
                <th class="h-7 w-[50px] p-1 text-[10px] font-medium uppercase text-zinc-500 text-center">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {props.layers.map((frame) => (
                <tr
                  key={frame.id}
                  class={[
                    "border-b border-zinc-800/30 transition-colors",
                    {
                      "bg-blue-900/20 border-blue-800/30":
                        frame.id === props.selectedLayerId,
                      "hover:bg-zinc-800/20":
                        frame.id !== props.selectedLayerId,
                    },
                  ]}
                  onClick={() => handleFrameSelect(frame.id)}
                >
                  <td class="h-8 p-1 text-xs pl-2.5">
                    <div class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {frame.name}
                    </div>
                  </td>
                  <td class="h-8 p-1 text-xs text-center">
                    {frame.images.length}
                  </td>
                  <td class="h-8 p-1 text-xs">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        class="h-5 w-5 rounded-sm p-0.5 inline-flex items-center justify-center hover:bg-zinc-700/40 transition-colors"
                        onClick={(e) =>
                          handleLayerToggleVisibility(frame.id, e)
                        }
                        title={frame.visible ? "隐藏图层" : "显示图层"}
                      >
                        {frame.visible ? (
                          <Eye class="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff class="h-3.5 w-3.5 text-zinc-500" />
                        )}
                      </button>
                      <button
                        class="h-5 w-5 rounded-sm p-0.5 inline-flex items-center justify-center hover:bg-red-900/40 hover:text-red-400 transition-colors"
                        onClick={(e) => handleFrameDelete(frame.id, e)}
                        title="删除图层"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
});
