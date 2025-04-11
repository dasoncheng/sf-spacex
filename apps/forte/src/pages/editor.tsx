import {
  defineComponent,
  ref,
  computed,
  reactive,
  onMounted,
  onUnmounted,
  ComponentPublicInstance,
} from "vue";
import { Subject, takeUntil } from "rxjs";
import { EventType, fromElement } from "../utils/mouse";
import {
  GifExportStatus,
  findLayerAtPosition,
  synthesizeGif,
} from "../utils/frame";
import { LayerInfo, TransferListToLayers } from "../utils/resource";
import { version } from "../utils/device";
import { ResourceConfig, ActType, ActOutput, ActDir } from "../models/act";

// 导入新拆分的组件
import { SidebarNav } from "../components/editor/SidebarNav";
import { LayerPanel } from "../components/editor/LayerPanel";
import { BackgroundPanel } from "../components/editor/BackgroundPanel";
import { PreviewArea } from "../components/editor/PreviewArea";
import { ControlBar } from "../components/editor/ControlBar";
import { StatusBar } from "../components/status-bar";
import { LayerItem } from "../components/layer-list";
import { Console } from "../components/console";

export enum FrameStatus {
  Playing,
  Stop,
}

export const Editor = defineComponent({
  name: "Editor",
  setup() {
    // 核心状态管理
    const setting = reactive({
      speed: 120,
      status: FrameStatus.Stop,
    });
    const compressionLevel = ref(4);
    const selectedBackground = ref("special");
    const customBackgrounds = ref<any[]>([]);
    const selectedLayerId = ref<string>();
    const layers = ref<LayerItem[]>([]);
    const unsub$ = new Subject<void>();

    // 外观设置
    const backgroundOpacity = ref(0.3);
    const showGrid = ref(true);
    const showGlowEffect = ref(true);
    const frameFilter = ref<{
      acts: ActOutput[];
      dirs: ActDir[];
    }>({
      acts: [],
      dirs: [],
    });

    // 水印设置
    const watermarkSettings = reactive({
      enabled: false,
      text: "SF Forte",
      position: "bottomRight",
      fontSize: 16,
      color: "#ffffff",
      opacity: 0.35,
      rotation: 45,
      repeat: false,
      repeatGap: 100,
    });

    // 拖动相关状态
    const draggedLayer = ref<{
      x: number;
      y: number;
    }>();

    // 导出状态
    const isExporting = ref(false);
    const exportStatus = ref<GifExportStatus | null>(null);

    // 预览区域引用和尺寸
    const previewAreaRef = ref<ComponentPublicInstance | null>(null);
    const previewDimensions = ref({ width: 0, height: 0 });

    // 侧边栏和面板状态
    const activeSidebarPanel = ref<"layers" | "backgrounds">("layers");
    const currentMode = ref<"gif" | "layout" | "preview">("gif");
    const showSettingsPanel = ref(false);

    // 布局设置
    const layoutSettings = reactive({
      columnSpacing: 20,
      rowSpacing: 20,
    });

    // Console visibility state
    const isConsoleVisible = ref(false);

    // Toggle console visibility
    const toggleConsole = () => {
      isConsoleVisible.value = !isConsoleVisible.value;
    };

    // 图层操作方法
    const removeLayerById = (layerId: string) => {
      layers.value = layers.value.filter((frame) => frame.id !== layerId);
      if (selectedLayerId.value === layerId) {
        selectedLayerId.value =
          layers.value.length > 0 ? layers.value[0].id : "";
      }
    };

    const selectLayerById = (layerId: string) => {
      selectedLayerId.value = layerId;
    };

    const toggleLayerVisibility = (layerId: string) => {
      const layerIndex = layers.value.findIndex(
        (layer) => layer.id === layerId
      );
      if (layerIndex !== -1) {
        layers.value[layerIndex].visible = !layers.value[layerIndex].visible;
      }
    };

    const clearAllLayers = () => {
      layers.value = [];
      selectedLayerId.value = undefined;
    };

    const toggleAllLayersVisibility = () => {
      const hasVisibleLayers = layers.value.some((layer) => layer.visible);
      const newVisibilityState = !hasVisibleLayers;
      layers.value.forEach((layer) => {
        layer.visible = newVisibilityState;
      });
    };

    const areAllLayersVisible = computed(() => {
      return (
        layers.value.length > 0 && layers.value.every((layer) => layer.visible)
      );
    });

    // 背景管理方法
    const addCustomBackground = (newBackground: any) => {
      const exists = customBackgrounds.value.some(
        (bg) => bg.url === newBackground.url
      );
      if (!exists) {
        const img = new Image();
        img.onload = () => {
          customBackgrounds.value.push({
            ...newBackground,
            width: img.width,
            height: img.height,
          });
          selectedBackground.value = newBackground.id;
        };
        img.onerror = () => {
          alert("无法加载背景图片，请尝试其他图片");
        };
        img.src = newBackground.url;
      } else {
        const existing = customBackgrounds.value.find(
          (bg) => bg.url === newBackground.url
        );
        if (existing) {
          selectedBackground.value = existing.id;
        }
      }
    };

    const removeCustomBackground = (id: string) => {
      customBackgrounds.value = customBackgrounds.value.filter(
        (bg) => bg.id !== id
      );
      if (selectedBackground.value === id) {
        selectedBackground.value = "special";
      }
    };

    const clearAllCustomBackgrounds = () => {
      customBackgrounds.value = [];
      selectedBackground.value = "special";
    };

    // 播放控制方法
    const handlePlay = () => {
      setting.status = FrameStatus.Playing;
    };

    const handleStop = () => {
      setting.status = FrameStatus.Stop;
    };

    const isPlaying = computed(() => setting.status === FrameStatus.Playing);

    // 布局方法
    const layoutLayers = () => {
      if (layers.value.length === 0 || !previewAreaRef.value) return;

      const previewWidth = previewDimensions.value.width;
      const previewHeight = previewDimensions.value.height;

      const totalWidth = layers.value.reduce((sum, layer) => sum + layer.w, 0);
      const totalHeight = layers.value.reduce((sum, layer) => sum + layer.h, 0);
      const avgWidth = totalWidth / layers.value.length;
      const avgHeight = totalHeight / layers.value.length;

      const margin = 20;
      const availableWidth = previewWidth - 2 * margin;

      const cols = Math.max(
        1,
        Math.floor(availableWidth / (avgWidth + layoutSettings.columnSpacing))
      );
      const rows = Math.ceil(layers.value.length / cols);

      const gridWidth =
        cols * avgWidth + (cols - 1) * layoutSettings.columnSpacing;
      const gridHeight =
        rows * avgHeight + (rows - 1) * layoutSettings.rowSpacing;
      const startX = (previewWidth - gridWidth) / 2;
      const startY = (previewHeight - gridHeight) / 2;

      layers.value.forEach((layer, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const x = startX + col * (avgWidth + layoutSettings.columnSpacing);
        const y = startY + row * (avgHeight + layoutSettings.rowSpacing);

        layer.x = x;
        layer.y = y;
      });
    };

    // GIF导出方法
    const handleExportGif = async () => {
      if (layers.value.length === 0 || isExporting.value) {
        return;
      }

      isExporting.value = true;
      exportStatus.value = { phase: "preparing", progress: 0 };

      try {
        const canvasSize = {
          width: previewDimensions.value.width,
          height: previewDimensions.value.height,
        };

        let customBackgroundImage: HTMLImageElement | undefined;

        if (selectedBackground.value.startsWith("custom-")) {
          const customBg = customBackgrounds.value.find(
            (bg) => bg.id === selectedBackground.value
          );

          if (customBg) {
            customBackgroundImage = await new Promise<HTMLImageElement>(
              (resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = customBg.url;
              }
            );
          }
        }

        const exportOptions = {
          backgroundOpacity: backgroundOpacity.value,
          showGrid: showGrid.value,
          showGlowEffect: showGlowEffect.value,
          watermark: watermarkSettings.enabled
            ? { ...watermarkSettings }
            : null,
        };

        const gifObservable = synthesizeGif(
          layers.value,
          setting.speed,
          canvasSize,
          selectedBackground.value,
          frameFilter.value,
          customBackgroundImage,
          exportOptions
        );

        gifObservable.pipe(takeUntil(unsub$)).subscribe({
          next: (status) => {
            exportStatus.value = status;

            if (status.phase === "completed" && status.blob) {
              const downloadUrl = URL.createObjectURL(status.blob);
              const downloadLink = document.createElement("a");
              downloadLink.href = downloadUrl;
              downloadLink.download = `sforte-${new Date().getTime()}.gif`;

              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);

              setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

              setTimeout(() => {
                isExporting.value = false;
                exportStatus.value = null;
              }, 1000);
            }
          },
          error: (error) => {
            alert("导出失败，请检查控制台获取详细错误信息");
            isExporting.value = false;
            exportStatus.value = { phase: "error", progress: 0, error };

            setTimeout(() => {
              exportStatus.value = null;
            }, 3000);
          },
          complete: () => {
            // 导出完成
          },
        });
      } catch (error) {
        alert("导出设置失败，请检查控制台获取详细错误信息");
        isExporting.value = false;
        exportStatus.value = null;
      }
    };

    // 拖拽处理
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = previewAreaRef.value?.$el?.getBoundingClientRect();
      if (!rect || !e.dataTransfer?.items) return;

      const offsetX = Math.round(e.clientX - rect.left);
      const offsetY = Math.round(e.clientY - rect.top);

      const result = await TransferListToLayers(e.dataTransfer.items);

      if (result.length > 0) {
        if (result.length === 1) {
          layers.value.push({
            ...result[0],
            visible: true,
            x: offsetX - result[0].w / 2,
            y: offsetY - result[0].h / 2,
          });
        } else {
          const newLayers = arrangeLayersInGrid(
            result,
            offsetX,
            offsetY,
            rect.width,
            rect.height
          );
          layers.value.push(...newLayers);
        }

        selectedLayerId.value = result[0].id;
      }
    };

    const arrangeLayersInGrid = (
      layers: LayerInfo[],
      centerX: number,
      centerY: number,
      maxWidth: number,
      maxHeight: number
    ): LayerItem[] => {
      const count = layers.length;
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);

      const avgWidth = layers.reduce((sum, layer) => sum + layer.w, 0) / count;
      const avgHeight = layers.reduce((sum, layer) => sum + layer.h, 0) / count;

      const spacingX = avgWidth + 20;
      const spacingY = avgHeight + 20;

      const startX = centerX - ((cols - 1) * spacingX) / 2;
      const startY = centerY - ((rows - 1) * spacingY) / 2;

      return layers.map((layer, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        let x = startX + col * spacingX;
        let y = startY + row * spacingY;

        x = x - layer.w / 2;
        y = y - layer.h / 2;

        x = Math.max(10, Math.min(maxWidth - layer.w - 10, x));
        y = Math.max(10, Math.min(maxHeight - layer.h - 10, y));

        return {
          ...layer,
          visible: true,
          x,
          y,
        };
      });
    };

    // 用于导出状态显示
    const exportPhaseText = computed(() => {
      if (!exportStatus.value) return "";

      const phaseMap: Record<string, string> = {
        preparing: "准备中",
        rendering: "渲染帧",
        encoding: "编码中",
        completed: "已完成",
        error: "出错了",
      };

      return phaseMap[exportStatus.value.phase] || exportStatus.value.phase;
    });

    const exportProgressText = computed(() => {
      if (!exportStatus.value) return "";
      return `${Math.round(exportStatus.value.progress * 100)}%`;
    });

    // 计算帧数和时长
    const framesCount = computed(() => {
      return layers.value.reduce((max, layer) => {
        return Math.max(max, layer.images?.length || 0);
      }, 0);
    });

    const totalDuration = computed(() => {
      return framesCount.value * setting.speed;
    });

    // 应用模式切换
    const switchMode = (mode: "gif" | "layout" | "preview") => {
      currentMode.value = mode;
      showSettingsPanel.value = false;
    };

    // 更新预览区域尺寸
    const updatePreviewDimensions = () => {
      if (previewAreaRef.value && previewAreaRef.value.$el) {
        previewDimensions.value = {
          width: previewAreaRef.value.$el.clientWidth,
          height: previewAreaRef.value.$el.clientHeight,
        };
      }
    };

    // Add a computed property to get the configuration of the selected layer
    const selectedLayerConfig = computed<ResourceConfig>(() => {
      const selectedLayer = layers.value.find(
        (layer) => layer.id === selectedLayerId.value
      );

      // Return the selected layer config or a default empty config
      return (
        selectedLayer?.config || {
          Type: ActType.None,
          Actions: [],
        }
      );
    });

    // Handle configuration updates from the Console component
    const handleConfigUpdate = (newConfig: ResourceConfig) => {
      const layerIndex = layers.value.findIndex(
        (layer) => layer.id === selectedLayerId.value
      );

      if (layerIndex !== -1) {
        // Ensure the layer has a config property
        if (!layers.value[layerIndex].config) {
          layers.value[layerIndex].config = {
            Type: ActType.None,
            Actions: [],
          };
        }

        // Update the layer's configuration
        layers.value[layerIndex].config = newConfig;
      }
    };

    // 生命周期钩子
    onMounted(() => {
      updatePreviewDimensions();
      window.addEventListener("resize", updatePreviewDimensions);

      if (previewAreaRef.value && previewAreaRef.value.$el) {
        fromElement(previewAreaRef.value.$el)
          .pipe(takeUntil(unsub$))
          .subscribe((res) => {
            switch (res.type) {
              case EventType.MOUSE_DOWN:
                const clickedFrameId = findLayerAtPosition(
                  res.point.x,
                  res.point.y,
                  layers.value
                );
                selectedLayerId.value = clickedFrameId ?? selectedLayerId.value;
                const clickedFrame = layers.value.find(
                  (f) => f.id === selectedLayerId.value
                );

                draggedLayer.value = clickedFrame
                  ? {
                      x: clickedFrame.x,
                      y: clickedFrame.y,
                    }
                  : undefined;
                break;

              case EventType.MOUSE_MOVE:
                if (draggedLayer.value) {
                  const frameIndex = layers.value.findIndex(
                    (f) => f.id === selectedLayerId.value
                  );
                  if (frameIndex !== -1) {
                    layers.value[frameIndex].x =
                      draggedLayer.value.x + res.offset.x;
                    layers.value[frameIndex].y =
                      draggedLayer.value.y + res.offset.y;
                  }
                }
                break;

              case EventType.MOUSE_UP:
                break;

              default:
                break;
            }
          });

        previewAreaRef.value.$el.addEventListener("dragenter", handleDragEnter);
        previewAreaRef.value.$el.addEventListener("dragover", handleDragOver);
        previewAreaRef.value.$el.addEventListener("dragleave", handleDragLeave);
        previewAreaRef.value.$el.addEventListener("drop", handleDrop);
      }
    });

    onUnmounted(() => {
      unsub$.next();
      unsub$.complete();
      window.removeEventListener("resize", updatePreviewDimensions);

      if (previewAreaRef.value && previewAreaRef.value.$el) {
        previewAreaRef.value.$el.removeEventListener(
          "dragenter",
          handleDragEnter
        );
        previewAreaRef.value.$el.removeEventListener(
          "dragover",
          handleDragOver
        );
        previewAreaRef.value.$el.removeEventListener(
          "dragleave",
          handleDragLeave
        );
        previewAreaRef.value.$el.removeEventListener("drop", handleDrop);
      }
    });

    return () => (
      <div class="flex h-screen flex-col bg-zinc-950 text-zinc-200">
        <div class="relative z-0 flex flex-1 overflow-hidden">
          {/* 侧边栏导航 */}
          <SidebarNav
            activeSidebarPanel={activeSidebarPanel.value}
            showSettingsPanel={showSettingsPanel.value}
            currentMode={currentMode.value}
            onSwitchPanel={(panel) => (activeSidebarPanel.value = panel)}
            onToggleSettings={() =>
              (showSettingsPanel.value = !showSettingsPanel.value)
            }
            onSwitchMode={switchMode}
          />

          {/* 面板区域 */}
          <div class="w-60 border-r border-zinc-800/50 bg-zinc-900 flex flex-col">
            {activeSidebarPanel.value === "layers" && (
              <LayerPanel
                layers={layers.value}
                selectedLayerId={selectedLayerId.value}
                onDeleteLayer={removeLayerById}
                onSelectLayer={selectLayerById}
                onToggleVisibility={toggleLayerVisibility}
                onClearAllLayers={clearAllLayers}
                onToggleAllLayersVisibility={toggleAllLayersVisibility}
                areAllLayersVisible={areAllLayersVisible.value}
              />
            )}

            {activeSidebarPanel.value === "backgrounds" && (
              <BackgroundPanel
                selectedBackground={selectedBackground.value}
                customBackgrounds={customBackgrounds.value}
                onUpdateSelectedBackground={(value) =>
                  (selectedBackground.value = value)
                }
                onAddCustomBackground={addCustomBackground}
                onRemoveCustomBackground={removeCustomBackground}
                onClearAllCustomBackgrounds={clearAllCustomBackgrounds}
              />
            )}
          </div>

          {/* 预览区域 */}
          <div class="relative flex-1 flex flex-col bg-gradient-to-b from-zinc-900 to-zinc-950 p-3">
            {/* 预览控制栏 */}
            <ControlBar
              previewDimensions={previewDimensions.value}
              isPlaying={isPlaying.value}
              isExporting={isExporting.value}
              hasLayers={layers.value.length > 0}
              isConsoleVisible={isConsoleVisible.value}
              onPlay={handlePlay}
              onStop={handleStop}
              onExport={handleExportGif}
              onLayout={layoutLayers}
              onToggleConsole={toggleConsole}
            />

            {/* 预览区域内容 */}
            <PreviewArea
              ref={previewAreaRef}
              layers={layers.value}
              selectedBackground={selectedBackground.value}
              customBackgrounds={customBackgrounds.value}
              setting={setting}
              backgroundOpacity={backgroundOpacity.value}
              showGrid={showGrid.value}
              showGlowEffect={showGlowEffect.value}
              watermarkSettings={watermarkSettings}
              filter={frameFilter.value}
            />

            {/* Console positioned at the bottom of preview area */}
            <Console
              visible={isConsoleVisible.value}
              currentConfig={selectedLayerConfig.value}
              filter={frameFilter.value}
              onUpdate:filter={(value) => {
                frameFilter.value = value;
              }}
              onClose={toggleConsole}
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        </div>

        {/* 状态栏 */}
        <StatusBar
          framesCount={framesCount.value}
          totalDuration={totalDuration.value}
          compressionLevel={compressionLevel.value}
          speed={setting.speed}
          version={version}
          onUpdate:compressionLevel={(value) =>
            (compressionLevel.value = value)
          }
          onUpdate:speed={(value) => (setting.speed = value)}
          exportStatus={exportStatus.value}
          exportPhaseText={exportPhaseText.value}
          exportProgressText={exportProgressText.value}
          backgroundOpacity={backgroundOpacity.value}
          showGrid={showGrid.value}
          showGlowEffect={showGlowEffect.value}
          onUpdate:backgroundOpacity={(value) =>
            (backgroundOpacity.value = value)
          }
          onUpdate:showGrid={(value) => (showGrid.value = value)}
          onUpdate:showGlowEffect={(value) => (showGlowEffect.value = value)}
          watermarkSettings={watermarkSettings}
          onUpdate:watermarkSettings={(value) => {
            Object.assign(watermarkSettings, value);
          }}
          currentMode={currentMode.value}
          layoutSettings={layoutSettings}
          onUpdate:layoutSettings={(value) => {
            Object.assign(layoutSettings, value);
          }}
        />
      </div>
    );
  },
});
