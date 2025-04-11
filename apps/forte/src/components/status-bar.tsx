import {
  computed,
  defineComponent,
  PropType,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";
import {
  Clock,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Grid,
  Droplets,
  Eye,
  Type,
  Film,
  Layout as LayoutIcon,
  Image as ImageIcon,
  Columns,
  Rows,
  RotateCw,
  Copy,
} from "lucide-vue-next";
import { GifExportStatus } from "../utils/frame";

// Update watermark settings interface
interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number; // 添加旋转角度
  repeat: boolean; // 添加平铺选项
  repeatGap: number; // 平铺间距
}

export const StatusBar = defineComponent({
  name: "StatusBar",
  props: {
    framesCount: { type: Number, required: true },
    totalDuration: { type: Number, required: true },
    compressionLevel: { type: Number, default: 4 },
    speed: { type: Number, default: 120 },
    version: { type: String, required: true },
    exportStatus: {
      type: Object as PropType<GifExportStatus | null>,
      default: null,
    },
    exportPhaseText: { type: String, default: "" },
    exportProgressText: { type: String, default: "" },
    backgroundOpacity: { type: Number, required: true },
    showGrid: { type: Boolean, required: true },
    showGlowEffect: { type: Boolean, required: true },
    watermarkSettings: {
      type: Object as PropType<WatermarkSettings>,
      required: true,
    },
    currentMode: {
      type: String as PropType<"gif" | "layout" | "preview">,
      default: "gif",
    },
    layoutSettings: {
      type: Object as PropType<{
        columnSpacing: number;
        rowSpacing: number;
      }>,
      required: true,
    },
  },

  emits: [
    "update:compressionLevel",
    "update:speed",
    "update:backgroundOpacity",
    "update:showGrid",
    "update:showGlowEffect",
    "update:watermarkSettings",
    "update:layoutSettings",
  ],

  setup(props, { emit }) {
    const showSpeedPopover = ref(false);
    const showAppearancePopover = ref(false);
    const showWatermarkPopover = ref(false);
    const showLayoutPopover = ref(false); // Add new state for layout popover
    const appearancePopoverRef = ref<HTMLElement | null>(null);
    const appearanceButtonRef = ref<HTMLElement | null>(null);
    const watermarkPopoverRef = ref<HTMLElement | null>(null);
    const watermarkButtonRef = ref<HTMLElement | null>(null);
    const layoutPopoverRef = ref<HTMLElement | null>(null);
    const layoutButtonRef = ref<HTMLElement | null>(null);
    const speedPopoverRef = ref<HTMLElement | null>(null);
    const speedButtonRef = ref<HTMLElement | null>(null);

    const durationText = computed(() => {
      if (props.totalDuration < 1000) {
        return `${props.totalDuration}ms`;
      }
      return `${(props.totalDuration / 1000).toFixed(2)}s`;
    });

    const toggleSpeedPopover = () => {
      showSpeedPopover.value = !showSpeedPopover.value;
      if (showSpeedPopover.value) {
        nextTick(() => {
          document.addEventListener("click", handleOutsideSpeedClick);
        });
      } else {
        document.removeEventListener("click", handleOutsideSpeedClick);
      }
    };

    const toggleAppearancePopover = () => {
      showAppearancePopover.value = !showAppearancePopover.value;
      if (showAppearancePopover.value) {
        nextTick(() => {
          document.addEventListener("click", handleOutsideAppearanceClick);
        });
      } else {
        document.removeEventListener("click", handleOutsideAppearanceClick);
      }
    };

    const toggleWatermarkPopover = () => {
      showWatermarkPopover.value = !showWatermarkPopover.value;
      if (showWatermarkPopover.value) {
        nextTick(() => {
          document.addEventListener("click", handleOutsideWatermarkClick);
        });
      } else {
        document.removeEventListener("click", handleOutsideWatermarkClick);
      }
    };

    const toggleLayoutPopover = () => {
      showLayoutPopover.value = !showLayoutPopover.value;
      if (showLayoutPopover.value) {
        nextTick(() => {
          document.addEventListener("click", handleOutsideLayoutClick);
        });
      } else {
        document.removeEventListener("click", handleOutsideLayoutClick);
      }
    };

    const handleOutsideAppearanceClick = (e: MouseEvent) => {
      if (
        appearancePopoverRef.value &&
        !appearancePopoverRef.value.contains(e.target as Node) &&
        appearanceButtonRef.value &&
        !appearanceButtonRef.value.contains(e.target as Node)
      ) {
        showAppearancePopover.value = false;
        document.removeEventListener("click", handleOutsideAppearanceClick);
      }
    };

    const handleOutsideSpeedClick = (e: MouseEvent) => {
      if (
        speedPopoverRef.value &&
        !speedPopoverRef.value.contains(e.target as Node) &&
        speedButtonRef.value &&
        !speedButtonRef.value.contains(e.target as Node)
      ) {
        showSpeedPopover.value = false;
        document.removeEventListener("click", handleOutsideSpeedClick);
      }
    };

    const handleOutsideWatermarkClick = (e: MouseEvent) => {
      if (
        watermarkPopoverRef.value &&
        !watermarkPopoverRef.value.contains(e.target as Node) &&
        watermarkButtonRef.value &&
        !watermarkButtonRef.value.contains(e.target as Node)
      ) {
        showWatermarkPopover.value = false;
        document.removeEventListener("click", handleOutsideWatermarkClick);
      }
    };

    const handleOutsideLayoutClick = (e: MouseEvent) => {
      if (
        layoutPopoverRef.value &&
        !layoutPopoverRef.value.contains(e.target as Node) &&
        layoutButtonRef.value &&
        !layoutButtonRef.value.contains(e.target as Node)
      ) {
        showLayoutPopover.value = false;
        document.removeEventListener("click", handleOutsideLayoutClick);
      }
    };

    const decreaseSpeed = () => {
      if (props.speed > 50) {
        emit("update:speed", props.speed - 10);
      }
    };

    const increaseSpeed = () => {
      if (props.speed < 500) {
        emit("update:speed", props.speed + 10);
      }
    };

    const updateSpeed = (e: Event) => {
      const value = Number((e.target as HTMLInputElement).value);
      emit("update:speed", value);
    };

    const updateWatermarkSettings = (key: string, value: any) => {
      emit("update:watermarkSettings", {
        ...props.watermarkSettings,
        [key]: value,
      });
    };

    const updateColumnSpacing = (value: number) => {
      emit("update:layoutSettings", {
        ...props.layoutSettings,
        columnSpacing: value,
      });
    };

    const updateRowSpacing = (value: number) => {
      emit("update:layoutSettings", {
        ...props.layoutSettings,
        rowSpacing: value,
      });
    };

    onMounted(() => {
      if (showAppearancePopover.value) {
        document.addEventListener("click", handleOutsideAppearanceClick);
      }
      if (showSpeedPopover.value) {
        document.addEventListener("click", handleOutsideSpeedClick);
      }
      if (showWatermarkPopover.value) {
        document.addEventListener("click", handleOutsideWatermarkClick);
      }
      if (showLayoutPopover.value) {
        document.addEventListener("click", handleOutsideLayoutClick);
      }
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleOutsideAppearanceClick);
      document.removeEventListener("click", handleOutsideSpeedClick);
      document.removeEventListener("click", handleOutsideWatermarkClick);
      document.removeEventListener("click", handleOutsideLayoutClick);
    });

    return () => (
      <footer class="relative z-1 flex h-25px items-center bg-zinc-950 border-t border-zinc-800/50 text-[11px] text-zinc-400">
        {/* Left status info */}
        <div class="flex h-full items-center">
          <div class="flex h-full items-center px-2 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors">
            <div class="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
            <span>就绪</span>
          </div>

          {/* Current mode indicator */}
          {/* <div class="flex h-full items-center px-2 border-r border-zinc-800/50">
            <span>
              {props.currentMode === "gif" && (
                <>
                  <Film class="inline-block h-3 w-3 mr-1 text-blue-400" />
                  GIF录制模式
                </>
              )}
              {props.currentMode === "layout" && (
                <>
                  <Layout class="inline-block h-3 w-3 mr-1 text-blue-400" />
                  图片排版模式
                </>
              )}
              {props.currentMode === "preview" && (
                <>
                  <ImageIcon class="inline-block h-3 w-3 mr-1 text-blue-400" />
                  素材预览模式
                </>
              )}
            </span>
          </div> */}

          {/* Conditionally show mode-specific status items */}
          {props.currentMode === "gif" && (
            <>
              <div class="flex h-full items-center px-2 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors">
                <span>帧数: {props.framesCount}</span>
              </div>

              <div class="flex h-full items-center px-2 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors">
                <span>时长: {durationText.value}</span>
              </div>

              {/* Export status */}
              {props.exportStatus && (
                <div
                  class={`flex h-full items-center px-3 space-x-1 ${
                    props.exportStatus.phase === "error"
                      ? "text-red-400"
                      : props.exportStatus.phase === "completed"
                      ? "text-green-400"
                      : "text-blue-400"
                  }`}
                >
                  {props.exportStatus.phase === "encoding" ||
                  props.exportStatus.phase === "rendering" ? (
                    <RefreshCw class="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  <span>{props.exportPhaseText}</span>
                  {props.exportProgressText && (
                    <span>{props.exportProgressText}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right interactive controls - only show relevant controls for current mode */}
        <div class="ml-auto flex h-full items-center">
          {
            <>
              {/* Layout settings button */}
              <div class="relative h-full">
                <button
                  ref={layoutButtonRef}
                  class="flex h-full items-center rounded-none px-2 py-0 text-[11px] hover:bg-zinc-800/50 hover:text-blue-300 transition-colors"
                  onClick={toggleLayoutPopover}
                >
                  <LayoutIcon class="mr-1 h-3.5 w-3.5" />
                  <span>排版</span>
                </button>
                {/* Layout popover */}
                {showLayoutPopover.value && (
                  <div
                    ref={layoutPopoverRef}
                    class="absolute bottom-full right-0 mb-1 w-60 rounded border border-zinc-700/50 bg-zinc-900/95 p-3 shadow-lg backdrop-blur-sm"
                  >
                    <div class="mb-2 text-xs font-medium text-zinc-400">
                      排版设置
                    </div>

                    {/* Column Spacing */}
                    <div class="mb-3">
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs text-zinc-500">
                          <Columns class="mr-1 inline h-3 w-3" />
                          列间距
                        </label>
                        <span class="text-xs text-zinc-600">
                          {props.layoutSettings.columnSpacing}px
                        </span>
                      </div>
                      <div class="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={props.layoutSettings.columnSpacing}
                          onInput={(e) =>
                            updateColumnSpacing(
                              Number((e.target as HTMLInputElement).value)
                            )
                          }
                          class="flex-1 accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                        />
                        <input
                          type="number"
                          class="w-12 h-5 ml-2 px-1 bg-zinc-800 border border-zinc-700 rounded text-center text-xs"
                          value={props.layoutSettings.columnSpacing}
                          min="0"
                          max="100"
                          step="5"
                          onChange={(e) =>
                            updateColumnSpacing(
                              Number((e.target as HTMLInputElement).value)
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Row Spacing */}
                    <div class="mb-1">
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs text-zinc-500">
                          <Rows class="mr-1 inline h-3 w-3" />
                          行间距
                        </label>
                        <span class="text-xs text-zinc-600">
                          {props.layoutSettings.rowSpacing}px
                        </span>
                      </div>
                      <div class="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={props.layoutSettings.rowSpacing}
                          onInput={(e) =>
                            updateRowSpacing(
                              Number((e.target as HTMLInputElement).value)
                            )
                          }
                          class="flex-1 accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                        />
                        <input
                          type="number"
                          class="w-12 h-5 ml-2 px-1 bg-zinc-800 border border-zinc-700 rounded text-center text-xs"
                          value={props.layoutSettings.rowSpacing}
                          min="0"
                          max="100"
                          step="5"
                          onChange={(e) =>
                            updateRowSpacing(
                              Number((e.target as HTMLInputElement).value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Watermark settings button */}
              <div class="relative h-full">
                <button
                  ref={watermarkButtonRef}
                  class="flex h-full items-center rounded-none px-2 py-0 text-[11px] hover:bg-zinc-800/50 hover:text-blue-300 transition-colors"
                  onClick={toggleWatermarkPopover}
                >
                  <Type class="mr-1 h-3.5 w-3.5" />
                  <span>水印</span>
                </button>
                {/* Watermark popover */}
                {showWatermarkPopover.value && (
                  <div
                    ref={watermarkPopoverRef}
                    class="absolute bottom-full right-0 mb-1 w-72 rounded border border-zinc-700/50 bg-zinc-900/95 p-3 shadow-lg backdrop-blur-sm"
                  >
                    <div class="mb-2 text-xs font-medium text-zinc-400 flex justify-between items-center">
                      <span>水印设置</span>
                      <span class="text-[10px] text-blue-400">
                        实时预览已启用
                      </span>
                    </div>

                    {/* Enable Watermark Toggle */}
                    <div class="mb-3 flex items-center justify-between">
                      <label class="text-xs text-zinc-500">
                        <Type class="mr-1 inline h-3 w-3" />
                        启用水印
                      </label>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={props.watermarkSettings.enabled}
                          onChange={(e) =>
                            updateWatermarkSettings(
                              "enabled",
                              (e.target as HTMLInputElement).checked
                            )
                          }
                          class="sr-only peer"
                        />
                        <div class="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Watermark Text Input */}
                    <div class="mb-3">
                      <label class="block mb-1 text-xs text-zinc-500">
                        水印文本
                      </label>
                      <input
                        type="text"
                        value={props.watermarkSettings.text}
                        onInput={(e) =>
                          updateWatermarkSettings(
                            "text",
                            (e.target as HTMLInputElement).value
                          )
                        }
                        class="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                        placeholder="输入水印文本"
                      />
                    </div>

                    {/* Watermark Position Select */}
                    <div class="mb-3">
                      <label class="block mb-1 text-xs text-zinc-500">
                        水印位置
                      </label>
                      <select
                        value={props.watermarkSettings.position}
                        onChange={(e) =>
                          updateWatermarkSettings(
                            "position",
                            (e.target as HTMLSelectElement).value
                          )
                        }
                        class="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                      >
                        <option value="topLeft">左上角</option>
                        <option value="topRight">右上角</option>
                        <option value="bottomLeft">左下角</option>
                        <option value="bottomRight">右下角</option>
                        <option value="center">居中</option>
                      </select>
                    </div>

                    {/* Font Size Slider */}
                    <div class="mb-3">
                      <div class="flex items-center justify-between">
                        <label class="text-xs text-zinc-500">字体大小</label>
                        <span class="text-xs text-zinc-600">
                          {props.watermarkSettings.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="32"
                        step="1"
                        value={props.watermarkSettings.fontSize}
                        onInput={(e) =>
                          updateWatermarkSettings(
                            "fontSize",
                            parseInt((e.target as HTMLInputElement).value)
                          )
                        }
                        class="mt-1 w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                      />
                    </div>

                    {/* Color Picker */}
                    <div class="mb-3">
                      <label class="block mb-1 text-xs text-zinc-500">
                        文本颜色
                      </label>
                      <div class="flex items-center">
                        <input
                          type="color"
                          value={props.watermarkSettings.color}
                          onChange={(e) =>
                            updateWatermarkSettings(
                              "color",
                              (e.target as HTMLInputElement).value
                            )
                          }
                          class="w-8 h-8 rounded border border-zinc-700 bg-transparent"
                        />
                        <input
                          type="text"
                          value={props.watermarkSettings.color}
                          onInput={(e) =>
                            updateWatermarkSettings(
                              "color",
                              (e.target as HTMLInputElement).value
                            )
                          }
                          class="ml-2 w-24 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                        />
                      </div>
                    </div>

                    {/* Add Rotation Slider */}
                    <div class="mb-3">
                      <div class="flex items-center justify-between">
                        <label class="text-xs text-zinc-500">
                          <RotateCw class="mr-1 inline h-3 w-3" />
                          旋转角度
                        </label>
                        <span class="text-xs text-zinc-600">
                          {props.watermarkSettings.rotation}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={props.watermarkSettings.rotation}
                        onInput={(e) =>
                          updateWatermarkSettings(
                            "rotation",
                            parseInt((e.target as HTMLInputElement).value)
                          )
                        }
                        class="mt-1 w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                      />
                    </div>

                    {/* Add Repeat Toggle */}
                    <div class="mb-3 flex items-center justify-between">
                      <label class="text-xs text-zinc-500">
                        <Copy class="mr-1 inline h-3 w-3" />
                        平铺水印
                      </label>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={props.watermarkSettings.repeat}
                          onChange={(e) =>
                            updateWatermarkSettings(
                              "repeat",
                              (e.target as HTMLInputElement).checked
                            )
                          }
                          class="sr-only peer"
                        />
                        <div class="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Add Repeat Gap Slider - only shown if repeat is enabled */}
                    {props.watermarkSettings.repeat && (
                      <div class="mb-3">
                        <div class="flex items-center justify-between">
                          <label class="text-xs text-zinc-500">平铺间距</label>
                          <span class="text-xs text-zinc-600">
                            {props.watermarkSettings.repeatGap}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          step="10"
                          value={props.watermarkSettings.repeatGap}
                          onInput={(e) =>
                            updateWatermarkSettings(
                              "repeatGap",
                              parseInt((e.target as HTMLInputElement).value)
                            )
                          }
                          class="mt-1 w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                        />
                      </div>
                    )}

                    {/* Opacity Slider */}
                    <div class="mb-3">
                      <div class="flex items-center justify-between">
                        <label class="text-xs text-zinc-500">不透明度</label>
                        <span class="text-xs text-zinc-600">
                          {Math.round(props.watermarkSettings.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={props.watermarkSettings.opacity}
                        onInput={(e) =>
                          updateWatermarkSettings(
                            "opacity",
                            parseFloat((e.target as HTMLInputElement).value)
                          )
                        }
                        class="mt-1 w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Appearance settings button */}
              <div class="relative h-full">
                <button
                  ref={appearanceButtonRef}
                  class="flex h-full items-center rounded-none px-2 py-0 text-[11px] hover:bg-zinc-800/50 hover:text-blue-300 transition-colors"
                  onClick={toggleAppearancePopover}
                >
                  <Eye class="mr-1 h-3.5 w-3.5" />
                  <span>外观</span>
                </button>
                {/* Appearance popover */}
                {showAppearancePopover.value && (
                  <div
                    ref={appearancePopoverRef}
                    class="absolute bottom-full right-0 mb-1 w-60 rounded border border-zinc-700/50 bg-zinc-900/95 p-3 shadow-lg backdrop-blur-sm"
                  >
                    <div class="mb-2 text-xs font-medium text-zinc-400">
                      外观设置
                    </div>

                    {/* Background Opacity Slider */}
                    <div class="mb-3">
                      <div class="flex items-center justify-between">
                        <label class="text-xs text-zinc-500">
                          <Droplets class="mr-1 inline h-3 w-3" />
                          背景透明度
                        </label>
                        <span class="text-xs text-zinc-600">
                          {Math.round(props.backgroundOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={props.backgroundOpacity}
                        onInput={(e) =>
                          emit(
                            "update:backgroundOpacity",
                            parseFloat((e.target as HTMLInputElement).value)
                          )
                        }
                        class="mt-1 w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-full"
                      />
                    </div>

                    {/* Grid Toggle */}
                    <div class="mb-2 flex items-center justify-between">
                      <label class="text-xs text-zinc-500">
                        <Grid class="mr-1 inline h-3 w-3" />
                        显示网格
                      </label>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={props.showGrid}
                          onChange={(e) =>
                            emit(
                              "update:showGrid",
                              (e.target as HTMLInputElement).checked
                            )
                          }
                          class="sr-only peer"
                        />
                        <div class="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Glow Effect Toggle */}
                    <div class="flex items-center justify-between">
                      <label class="text-xs text-zinc-500">
                        <div class="inline-block h-3 w-3 mr-1 rounded-full bg-blue-500/50"></div>
                        中心渐变背景
                      </label>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={props.showGlowEffect}
                          onChange={(e) =>
                            emit(
                              "update:showGlowEffect",
                              (e.target as HTMLInputElement).checked
                            )
                          }
                          class="sr-only peer"
                        />
                        <div class="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Speed settings button */}
              <div class="relative h-full">
                <button
                  ref={speedButtonRef}
                  class="flex h-full items-center rounded-none px-2 py-0 text-[11px] hover:bg-zinc-800/50 hover:text-blue-300 transition-colors"
                  onClick={toggleSpeedPopover}
                >
                  <Clock class="mr-1 h-3.5 w-3.5" />
                  <span>速度: {props.speed}ms</span>
                </button>

                {/* Speed popover */}
                {showSpeedPopover.value && (
                  <div
                    ref={speedPopoverRef}
                    class="absolute right-0 bottom-6 w-48 rounded-md border border-zinc-700/50 bg-zinc-900/95 p-2 text-zinc-200 shadow-md backdrop-blur-sm z-10"
                  >
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <label for="speed-value" class="text-xs">
                          播放速度 (ms)
                        </label>
                        <div class="flex items-center">
                          <button
                            class="h-4 w-4 rounded-sm p-0 hover:bg-zinc-700 hover:text-blue-400"
                            onClick={decreaseSpeed}
                            disabled={props.speed <= 10}
                          >
                            <ChevronDown class="h-3 w-3" />
                          </button>
                          <input
                            id="speed-value"
                            type="number"
                            value={props.speed}
                            onInput={updateSpeed}
                            class="h-5 w-12 rounded border-zinc-700 bg-zinc-800 px-1 text-center text-xs"
                            min={10}
                            max={500}
                          />
                          <button
                            class="h-4 w-4 rounded-sm p-0 hover:bg-zinc-700 hover:text-blue-400"
                            onClick={increaseSpeed}
                            disabled={props.speed >= 500}
                          >
                            <ChevronUp class="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={500}
                        step={5}
                        value={props.speed}
                        onInput={updateSpeed}
                        class="h-1.5 w-full"
                      />
                      <div class="flex justify-between text-[10px] text-zinc-500">
                        <span>快 (10ms)</span>
                        <span>慢 (500ms)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          }

          {/* Version info - always show */}
          <div class="flex h-full items-center pl-2 pr-3 text-zinc-600 hover:text-zinc-400 transition-colors">
            <span>
              SFORTE V{props.version}
              <span class="mx-0.5em">·</span> Copyright ©{" "}
              {new Date().getFullYear()} 盛锋网络 版权所有
            </span>
          </div>
        </div>
      </footer>
    );
  },
});
