import { defineComponent } from "vue";
import {
  Play,
  StopCircle,
  Download,
  RefreshCw,
  Grid,
  Monitor,
} from "lucide-vue-next";

// Custom panel icon component
const IconLayoutPanel = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    return () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="h-3.5 w-3.5"
      >
        {props.visible ? (
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2 1L1 2V14L2 15H14L15 14V2L14 1H2ZM2 10V2H14V10H2Z"
          />
        ) : (
          <path d="M2 1.00073L1 2.00073V14.0007L2 15.0007H14L15 14.0007V2.00073L14 1.00073H2ZM2 10.0007V2.00073H14V10.0007H2ZM2 11.0007H14V14.0007H2V11.0007Z" />
        )}
      </svg>
    );
  },
});

export const ControlBar = defineComponent({
  name: "ControlBar",
  props: {
    previewDimensions: {
      type: Object,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    isExporting: {
      type: Boolean,
      default: false,
    },
    hasLayers: {
      type: Boolean,
      default: false,
    },
    isConsoleVisible: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["play", "stop", "export", "layout", "toggleConsole"],
  setup(props, { emit }) {
    return () => (
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center">
          <Monitor class="mr-1.5 h-4 w-4 text-blue-400" />
          <h2 class="text-xs font-medium uppercase tracking-wider text-zinc-300">
            预览
          </h2>
          <div class="ml-2 rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">
            {props.previewDimensions.width} x {props.previewDimensions.height}
          </div>

          {/* Console toggle button */}
          <button
            onClick={() => emit("toggleConsole")}
            class="ml-3 p-1 rounded-sm transition-colors bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70"
            title={props.isConsoleVisible ? "隐藏控制台" : "显示控制台"}
          >
            <IconLayoutPanel visible={props.isConsoleVisible} />
          </button>
        </div>
        <div class="flex gap-1">
          {/* Layout button */}
          <button
            class="h-6 rounded-sm border-zinc-700/50 bg-zinc-800/80 px-2 py-1 text-xs inline-flex items-center hover:bg-indigo-900/60 hover:text-indigo-300 transition-colors"
            onClick={() => emit("layout")}
            title="自动排版"
            disabled={!props.hasLayers}
          >
            <Grid class="mr-1 h-3 w-3" />
            <span>排版</span>
          </button>

          {!props.isPlaying && (
            <button
              class="h-6 rounded-sm border-zinc-700/50 bg-zinc-800/80 px-2 py-1 text-xs inline-flex items-center hover:bg-green-800/70 hover:text-green-300 transition-colors"
              onClick={() => emit("play")}
            >
              <Play class="mr-1 h-3 w-3 text-green-400" />
              <span>播放</span>
            </button>
          )}
          {props.isPlaying && (
            <button
              class="h-6 rounded-sm border-zinc-700/50 bg-zinc-800/80 px-2 py-1 text-xs inline-flex items-center hover:bg-red-900/70 hover:text-red-300 text-red-400 transition-colors"
              onClick={() => emit("stop")}
            >
              <StopCircle class="mr-1 h-3 w-3" />
              <span>停止</span>
            </button>
          )}
          {/* Export button */}
          <button
            class={`h-6 rounded-sm border-zinc-700/50 bg-zinc-800/80 px-2 py-1 text-xs inline-flex items-center transition-colors ${
              props.isExporting
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-900/60 hover:text-blue-300"
            }`}
            onClick={() => emit("export")}
            disabled={props.isExporting || !props.hasLayers}
          >
            {props.isExporting ? (
              <>
                <RefreshCw class="mr-1 h-3 w-3 animate-spin" />
                <span>导出中...</span>
              </>
            ) : (
              <>
                <Download class="mr-1 h-3 w-3" />
                <span>导出</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  },
});
