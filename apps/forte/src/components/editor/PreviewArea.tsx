import { defineComponent, computed, StyleValue, PropType } from "vue";
import { Layer } from "../layer";
import { LayerItem } from "../layer-list";
import { CustomBackground } from "../background-presets";
import { ActDir, ActOutput } from "../../models/act";

export const PreviewArea = defineComponent({
  name: "PreviewArea",
  props: {
    layers: {
      type: Array as PropType<LayerItem[]>,
      default: () => [],
    },
    selectedBackground: {
      type: String,
      required: true,
    },
    customBackgrounds: {
      type: Array as PropType<CustomBackground[]>,
      default: () => [],
    },
    setting: {
      type: Object,
      required: true,
    },
    backgroundOpacity: {
      type: Number,
      default: 0.3,
    },
    showGrid: {
      type: Boolean,
      default: true,
    },
    showGlowEffect: {
      type: Boolean,
      default: true,
    },
    watermarkSettings: {
      type: Object,
      required: true,
    },
    filter: {
      type: Object as PropType<{
        acts: ActOutput[];
        dirs: ActDir[];
      }>,
      required: true,
    },
  },
  setup(props, { attrs, expose }) {
    // Background style calculation
    const getSelectedBackgroundStyle = computed<StyleValue>(() => {
      if (props.selectedBackground.startsWith("custom-")) {
        const customBg = props.customBackgrounds.find(
          (bg) => bg.id === props.selectedBackground
        );
        if (customBg) {
          return {
            backgroundImage: `url(${customBg.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: props.backgroundOpacity,
          };
        }
      }

      // Preset background styles with dynamic opacity
      const presetStyles: Record<string, StyleValue> = {
        special: {
          background:
            "linear-gradient(to bottom right, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.8))",
          opacity: props.backgroundOpacity,
        },
        slow: {
          background:
            "linear-gradient(to bottom right, rgba(34, 197, 94, 0.5), rgba(20, 184, 166, 0.8))",
          opacity: props.backgroundOpacity,
        },
        equipment: {
          background:
            "linear-gradient(to bottom right, rgba(217, 119, 6, 0.5), rgba(234, 88, 12, 0.8))",
          opacity: props.backgroundOpacity,
        },
        "no-comment": {
          background:
            "linear-gradient(to bottom right, rgba(113, 113, 122, 0.5), rgba(82, 82, 91, 0.8))",
          opacity: props.backgroundOpacity,
        },
        time0: {
          background:
            "linear-gradient(to bottom right, rgba(236, 72, 153, 0.5), rgba(225, 29, 72, 0.8))",
          opacity: props.backgroundOpacity,
        },
        time1: {
          background:
            "linear-gradient(to bottom right, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.8))",
          opacity: props.backgroundOpacity,
        },
        equip1: {
          background:
            "linear-gradient(to bottom right, rgba(217, 119, 6, 0.5), rgba(234, 179, 8, 0.8))",
          opacity: props.backgroundOpacity,
        },
        single: {
          background:
            "linear-gradient(to bottom right, rgba(16, 185, 129, 0.5), rgba(34, 197, 94, 0.8))",
          opacity: props.backgroundOpacity,
        },
      };

      return presetStyles[props.selectedBackground] || {};
    });

    // Watermark rendering
    const renderWatermark = computed(() => {
      if (!props.watermarkSettings.enabled || !props.watermarkSettings.text) {
        return null;
      }

      // If repeat mode is enabled, create a watermark layer covering the entire container
      if (props.watermarkSettings.repeat) {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                backgroundImage: `repeating-linear-gradient(${
                  props.watermarkSettings.rotation
                }deg, transparent, transparent ${
                  props.watermarkSettings.repeatGap - 5
                }px, rgba(0,0,0,0.01) ${props.watermarkSettings.repeatGap}px)`,
                color: props.watermarkSettings.color,
                opacity: props.watermarkSettings.opacity,
                fontSize: `${props.watermarkSettings.fontSize}px`,
                fontFamily: "Arial, sans-serif",
                display: "flex",
                flexWrap: "wrap",
                gap: `${props.watermarkSettings.repeatGap}px`,
                transform: "translate(-50%, -50%)",
                width: "200%",
                height: "200%",
                padding: `${props.watermarkSettings.repeatGap}px`,
                userSelect: "none",
              }}
            >
              {/* Generate repeated watermarks with rotation */}
              {Array.from({ length: 100 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    transform: `rotate(${props.watermarkSettings.rotation}deg)`,
                    padding: "5px 10px",
                    whiteSpace: "nowrap",
                    opacity: props.watermarkSettings.opacity,
                  }}
                >
                  {props.watermarkSettings.text}
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Single watermark
      let style: StyleValue = {
        position: "absolute",
        color: props.watermarkSettings.color,
        opacity: props.watermarkSettings.opacity,
        fontSize: `${props.watermarkSettings.fontSize}px`,
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        pointerEvents: "none",
        userSelect: "none",
        whiteSpace: "nowrap" as const,
        transform: `rotate(${props.watermarkSettings.rotation}deg)`,
        zIndex: 10,
      };

      // Position the watermark
      switch (props.watermarkSettings.position) {
        case "topLeft":
          style = {
            ...style,
            top: "0",
            left: "0",
            transformOrigin: "top left",
          };
          break;
        case "topRight":
          style = {
            ...style,
            top: "0",
            right: "0",
            transformOrigin: "top right",
          };
          break;
        case "bottomLeft":
          style = {
            ...style,
            bottom: "0",
            left: "0",
            transformOrigin: "bottom left",
          };
          break;
        case "bottomRight":
          style = {
            ...style,
            bottom: "0",
            right: "0",
            transformOrigin: "bottom right",
          };
          break;
        case "center":
          style = {
            ...style,
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${props.watermarkSettings.rotation}deg)`,
            transformOrigin: "center",
          };
          break;
      }

      return <div style={style}>{props.watermarkSettings.text}</div>;
    });

    // Expose the element for parent component (needed for ref)
    expose();

    return () => (
      <div
        class="relative flex-1 overflow-hidden rounded-md border border-zinc-800/70 bg-black/80"
        {...attrs}
      >
        {/* Selected background */}
        <div
          class="absolute inset-0"
          style={getSelectedBackgroundStyle.value}
        ></div>

        {/* Grid background - conditionally shown */}
        {props.showGrid && (
          <div
            class="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        )}

        {/* Preview content */}
        <div class="relative flex h-full w-full items-center justify-center">
          {/* Glow effect - conditionally shown */}
          {props.showGlowEffect && (
            <div class="absolute h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-3xl"></div>
          )}

          {/* Display uploaded images or empty state */}
          {props.layers.length > 0 ? (
            props.layers.map(
              (frame) =>
                frame.visible && (
                  <Layer
                    key={frame.id}
                    value={frame}
                    speed={props.setting.speed}
                    status={props.setting.status}
                    filter={props.filter}
                  />
                )
            )
          ) : (
            <div class="text-center select-none">
              <div class="mb-3 text-sm font-medium text-zinc-400">
                拖放文件夹到此处
              </div>
              <div class="text-xs text-zinc-600">支持PNG图片格式</div>
            </div>
          )}

          {/* Watermark preview */}
          {renderWatermark.value}
        </div>
      </div>
    );
  },
});
