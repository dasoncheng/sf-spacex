import { LayerItem } from "../components/layer-list";
import { ActDir, ActOutput, ResourceConfig } from "../models/act";
import GIF from "./gif";
import { Observable } from "rxjs";

/**
 * 检测点击位置是否在某个帧的非透明区域内
 * @param x 点击的X坐标
 * @param y 点击的Y坐标
 * @param frame 要检测的帧
 * @returns 是否在帧的非透明区域内
 */
export function isPointInLayer(
  x: number,
  y: number,
  frame: LayerItem
): boolean {
  // 获取当前帧的偏移量（使用第一个图片的偏移量作为参考）
  const offsetX = frame.images.at(0)?.offset.at(0) ?? 0;
  const offsetY = frame.images.at(0)?.offset.at(1) ?? 0;

  // 先执行快速的边界框检测，考虑偏移量
  if (
    x < frame.x + offsetX ||
    x > frame.x + offsetX + frame.w ||
    y < frame.y + offsetY ||
    y > frame.y + offsetY + frame.h
  ) {
    return false;
  }

  // 计算点击坐标相对于帧内部的位置，考虑偏移量
  const relativeX = Math.floor(x - (frame.x + offsetX));
  const relativeY = Math.floor(y - (frame.y + offsetY));

  // 如果没有矩阵数据或矩阵为空，就只使用边界框检测
  if (!frame.matrix || frame.matrix.length === 0) {
    return true;
  }

  // 根据透明通道矩阵检查点击位置是否为非透明区域
  // 由于矩阵可能是经过采样的，需要找到最接近的采样点
  const matrixWidth = frame.matrix[0]?.length || 0;
  const matrixHeight = frame.matrix.length;

  if (matrixWidth === 0 || matrixHeight === 0) {
    return true;
  }

  // 计算在矩阵中的对应行和列
  const ratioX = matrixWidth / frame.w;
  const ratioY = matrixHeight / frame.h;

  const matrixX = Math.min(Math.floor(relativeX * ratioX), matrixWidth - 1);
  const matrixY = Math.min(Math.floor(relativeY * ratioY), matrixHeight - 1);

  // 确保矩阵坐标有效
  if (
    matrixX < 0 ||
    matrixY < 0 ||
    matrixX >= matrixWidth ||
    matrixY >= matrixHeight
  ) {
    return false;
  }

  // 如果矩阵中对应位置有值，则说明点击在非透明区域
  return !!frame.matrix[matrixY][matrixX];
}

/**
 * 查找点击位置下的帧ID
 * @param x 点击的X坐标
 * @param y 点击的Y坐标
 * @param layers 所有帧的数组
 * @returns 点击位置下的帧ID，如果没有则返回undefined
 */
export function findLayerAtPosition(
  x: number,
  y: number,
  layers: LayerItem[]
): string | undefined {
  // 反向遍历，使得"上层"的帧优先被选中
  for (let i = layers.length - 1; i >= 0; i--) {
    const frame = layers[i];
    if (isPointInLayer(x, y, frame)) {
      return frame.id;
    }
  }
  return undefined;
}

/**
 * GIF导出过程的状态信息
 */
export interface GifExportStatus {
  phase: "preparing" | "rendering" | "encoding" | "completed" | "error";
  progress: number;
  blob?: Blob;
  error?: Error;
}

/**
 * 水印设置
 */
export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number; // 添加角度旋转属性 (0-360)
  repeat: boolean; // 添加平铺重复属性
  repeatGap: number; // 平铺间距
}

/**
 * 导出配置选项
 */
export interface ExportOptions {
  backgroundOpacity: number;
  showGrid: boolean;
  showGlowEffect: boolean;
  watermark: WatermarkSettings | null;
}

/**
 * 合成GIF动画
 * @param layers 要合成的帧数组
 * @param speed 播放速度（毫秒每帧）
 * @param canvasSize 画布大小 {width, height}
 * @param background 背景配置，可以是CSS类名或自定义背景图片URL
 * @param customBackgroundImage 自定义背景图片对象（如果选择了自定义背景）
 * @param options 导出选项，包含外观设置
 * @param frameFilter 帧过滤选项，包含要显示的动作和方向
 * @returns Observable<GifExportStatus> 导出进度状态流
 */
export function synthesizeGif(
  layers: LayerItem[],
  speed: number,
  canvasSize: { width: number; height: number },
  background: string,
  frameFilter: {
    acts: ActOutput[];
    dirs: ActDir[];
  },
  customBackgroundImage?: HTMLImageElement,
  options: ExportOptions = {
    backgroundOpacity: 0.3,
    showGrid: true,
    showGlowEffect: true,
    watermark: null,
  }
): Observable<GifExportStatus> {
  return new Observable<GifExportStatus>((observer) => {
    // 创建用于渲染的Canvas
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    // 过滤出可见的帧
    const visibleLayers = layers.filter((layer) => layer.visible);

    // 打印筛选条件便于调试
    console.log("GIF Export Filter:", {
      acts: frameFilter.acts.map((act) => String(act)),
      dirs: frameFilter.dirs.map((dir) => Number(dir)),
    });

    // 分析每个图层的配置和元数据
    const layerMetadata = visibleLayers.map((layer) => {
      if (!layer.config || !layer.images.length) {
        return {
          layer,
          frameMetadata: [],
          validIndices: [], // 如果没有配置，默认不包含任何帧
        };
      }

      const config = layer.config as ResourceConfig;
      const frameMetadata: Array<{
        act: ActOutput | null;
        dir: ActDir | null;
      }> = [];

      // 初始化所有帧的元数据
      for (let i = 0; i < layer.images.length; i++) {
        frameMetadata.push({ act: null, dir: null });
      }

      // 分析帧元数据
      try {
        let frameIndex = 0;

        // 遍历配置中的每个动作
        config.Actions.forEach((action) => {
          const actionOutput = action.Output as ActOutput;

          // 遍历每个方向
          for (let dirIndex = 0; dirIndex < action.Dir; dirIndex++) {
            const direction = dirIndex as ActDir;

            // 遍历该方向下的每一帧
            for (let frame = 0; frame < action.Frame; frame++) {
              if (frameIndex < layer.images.length) {
                frameMetadata[frameIndex] = {
                  act: actionOutput,
                  dir: direction,
                };
                frameIndex++;
              }
            }
          }
        });

        console.log(
          `Layer ${layer.name}: Mapped ${frameIndex} frames out of ${layer.images.length}`
        );
      } catch (error) {
        console.error(
          "Error mapping frame metadata for layer:",
          layer.name,
          error
        );
      }

      // 严格筛选符合条件的帧
      const validIndices: number[] = [];

      for (let i = 0; i < frameMetadata.length; i++) {
        const meta = frameMetadata[i];

        // 如果没有元数据，跳过
        if (!meta.act || meta.dir === null) continue;

        // 检查动作是否匹配
        const actMatch =
          frameFilter.acts.length === 0 || frameFilter.acts.includes(meta.act);

        // 检查方向是否匹配
        const dirMatch =
          frameFilter.dirs.length === 0 || frameFilter.dirs.includes(meta.dir);

        // 只有当动作和方向都匹配时，才将该帧添加到有效帧列表
        if (actMatch && dirMatch) {
          validIndices.push(i);
        }
      }

      console.log(
        `Layer ${layer.name}: ${validIndices.length} valid frames after filtering`
      );

      return { layer, frameMetadata, validIndices };
    });

    // 验证是否有任何图层具有有效帧
    const anyValidFrames = layerMetadata.some(
      (meta) => meta.validIndices.length > 0
    );

    if (!anyValidFrames) {
      observer.error(
        new Error("使用当前筛选条件，没有找到有效的帧可以合成GIF")
      );
      return;
    }

    // 找出有效帧最多的图层，以确定总帧数
    const maxValidFrames = Math.max(
      ...layerMetadata.map((meta) => meta.validIndices.length),
      0 // 确保至少为0
    );

    if (maxValidFrames === 0) {
      observer.error(new Error("没有有效的图片可以合成GIF"));
      return;
    }

    // 通知准备阶段开始
    observer.next({ phase: "preparing", progress: 0 });

    // 绘制背景函数
    const drawBackground = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // 绘制背景 - 黑色底色
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // 绘制自定义背景或预设背景
      if (background.startsWith("custom-") && customBackgroundImage) {
        try {
          // 使用传入的自定义背景图像，应用设置的透明度
          ctx.globalAlpha = options.backgroundOpacity;
          ctx.drawImage(
            customBackgroundImage,
            0,
            0,
            canvasSize.width,
            canvasSize.height
          );
          ctx.globalAlpha = 1.0;
        } catch (err) {
          // console.error("Error drawing custom background:", err);
        }
      } else {
        // 使用预设背景颜色
        const bgColors: Record<string, { from: string; to: string }> = {
          special: {
            from: "rgba(168, 85, 247, 0.5)",
            to: "rgba(59, 130, 246, 0.8)",
          },
          slow: {
            from: "rgba(34, 197, 94, 0.5)",
            to: "rgba(20, 184, 166, 0.8)",
          },
          equipment: {
            from: "rgba(217, 119, 6, 0.5)",
            to: "rgba(234, 88, 12, 0.8)",
          },
          "no-comment": {
            from: "rgba(113, 113, 122, 0.5)",
            to: "rgba(82, 82, 91, 0.8)",
          },
          time0: {
            from: "rgba(236, 72, 153, 0.5)",
            to: "rgba(225, 29, 72, 0.8)",
          },
          time1: {
            from: "rgba(6, 182, 212, 0.5)",
            to: "rgba(59, 130, 246, 0.8)",
          },
          equip1: {
            from: "rgba(217, 119, 6, 0.5)",
            to: "rgba(234, 179, 8, 0.8)",
          },
          single: {
            from: "rgba(16, 185, 129, 0.5)",
            to: "rgba(34, 197, 94, 0.8)",
          },
        };

        if (bgColors[background]) {
          // 创建与UI预览相同的渐变背景
          const gradient = ctx.createLinearGradient(
            0,
            0,
            canvasSize.width,
            canvasSize.height
          );
          gradient.addColorStop(0, bgColors[background].from);
          gradient.addColorStop(1, bgColors[background].to);

          ctx.globalAlpha = options.backgroundOpacity;
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
          ctx.globalAlpha = 1.0;
        }
      }

      // 如果启用了网格背景，绘制网格
      if (options.showGrid) {
        ctx.strokeStyle = "#444444";
        ctx.globalAlpha = 0.1;
        ctx.beginPath();

        // 绘制垂直线
        for (let x = 0; x <= canvasSize.width; x += 20) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasSize.height);
        }

        // 绘制水平线
        for (let y = 0; y <= canvasSize.height; y += 20) {
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y);
        }

        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // 如果启用了中心渐变效果，绘制渐变效果
      if (options.showGlowEffect) {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const radius = Math.min(
          300,
          Math.min(canvasSize.width, canvasSize.height) / 2
        );

        // 创建径向渐变
        const glowGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius
        );
        glowGradient.addColorStop(0, "rgba(8, 145, 178, 0.05)"); // Cyan color
        glowGradient.addColorStop(1, "rgba(8, 145, 178, 0)");

        ctx.fillStyle = glowGradient;
        ctx.fillRect(
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2
        );
      }
    };

    // 添加绘制水印函数
    const drawWatermark = () => {
      if (
        !options.watermark ||
        !options.watermark.enabled ||
        !options.watermark.text
      ) {
        return;
      }

      const watermark = options.watermark;

      // 如果是平铺模式，绘制多个水印
      if (watermark.repeat) {
        // 保存当前绘图状态
        ctx.save();
        ctx.fillStyle = watermark.color;
        ctx.globalAlpha = watermark.opacity;
        ctx.font = `${watermark.fontSize}px Arial, sans-serif`;

        // 计算文字大小，用于确定间距
        const textMetrics = ctx.measureText(watermark.text);
        const textWidth = textMetrics.width;
        const textHeight = watermark.fontSize;

        // 设置间距（使用repeatGap属性）
        const gapX = watermark.repeatGap;
        const gapY = watermark.repeatGap;

        // 计算需要多少行和列来覆盖整个画布
        const cols = Math.ceil(canvasSize.width / gapX) + 1;
        const rows = Math.ceil(canvasSize.height / gapY) + 1;

        // 绘制旋转的水印文字
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * gapX;
            const y = row * gapY;

            // 保存上下文，应用旋转
            ctx.save();

            // 移动到水印位置
            ctx.translate(x, y);

            // 应用旋转（角度转弧度）
            ctx.rotate((watermark.rotation * Math.PI) / 180);

            // 绘制水印
            ctx.fillText(watermark.text, 0, 0);

            // 恢复上下文
            ctx.restore();
          }
        }

        // 恢复绘图状态
        ctx.restore();
        return;
      }

      // 单个水印的处理（改进现有代码）
      // 设置水印样式
      ctx.font = `${watermark.fontSize}px Arial, sans-serif`;
      ctx.fillStyle = watermark.color;
      ctx.globalAlpha = watermark.opacity;
      ctx.textBaseline = "middle";

      // 计算文本宽度用于定位
      const textWidth = ctx.measureText(watermark.text).width;
      const padding = 20; // 水印边距

      // 根据位置计算坐标
      let x = 0;
      let y = 0;

      switch (watermark.position) {
        case "topLeft":
          x = padding;
          y = padding + watermark.fontSize / 2;
          ctx.textAlign = "left";
          break;
        case "topRight":
          x = canvasSize.width - padding;
          y = padding + watermark.fontSize / 2;
          ctx.textAlign = "right";
          break;
        case "bottomLeft":
          x = padding;
          y = canvasSize.height - padding - watermark.fontSize / 2;
          ctx.textAlign = "left";
          break;
        case "bottomRight":
          x = canvasSize.width - padding;
          y = canvasSize.height - padding - watermark.fontSize / 2;
          ctx.textAlign = "right";
          break;
        case "center":
          x = canvasSize.width / 2;
          y = canvasSize.height / 2;
          ctx.textAlign = "center";
          break;
      }

      // 保存当前绘图状态
      ctx.save();

      // 根据水印位置设置旋转中心点
      switch (watermark.position) {
        case "topLeft":
          ctx.translate(x, y);
          break;
        case "topRight":
          ctx.translate(x, y);
          break;
        case "bottomLeft":
          ctx.translate(x, y);
          break;
        case "bottomRight":
          ctx.translate(x, y);
          break;
        case "center":
          ctx.translate(x, y);
          break;
      }

      // 应用旋转
      ctx.rotate((watermark.rotation * Math.PI) / 180);

      // 绘制水印文字（因为已经平移了坐标系，所以绘制在原点）
      ctx.fillText(watermark.text, 0, 0);

      // 恢复之前的绘图状态
      ctx.restore();

      // 恢复透明度
      ctx.globalAlpha = 1.0;
    };

    // 初始化GIF编码器
    const gif = new GIF({
      workers: 10,
      quality: 5,
      width: canvasSize.width,
      height: canvasSize.height,
      workerScript: "/gif.worker.js",
    });

    // 每批处理的帧数
    const BATCH_SIZE = 5;
    const totalFrames = maxValidFrames;

    // 通知渲染阶段开始
    observer.next({ phase: "rendering", progress: 0 });

    // 监听GIF编码完成事件
    gif.on("finished", (blob: Blob) => {
      observer.next({
        phase: "completed",
        progress: 1,
        blob,
      });
      observer.complete();
    });

    // 监听错误事件
    gif.on("error", (error: Error) => {
      observer.next({
        phase: "error",
        progress: 0,
        error,
      });
      observer.error(error);
    });

    // 监听进度
    gif.on("progress", (progress: number) => {
      observer.next({
        phase: "encoding",
        progress,
      });
    });

    // 递归函数用于分批添加帧
    const addFramesInBatches = (startIndex: number) => {
      const endIndex = Math.min(startIndex + BATCH_SIZE, totalFrames);

      // 添加这一批的帧
      for (let frameIndex = startIndex; frameIndex < endIndex; frameIndex++) {
        // 先绘制背景
        drawBackground();

        // 然后从底层到顶层依次绘制每个图层的对应帧
        for (
          let layerIndex = 0;
          layerIndex < layerMetadata.length;
          layerIndex++
        ) {
          const { layer, validIndices } = layerMetadata[layerIndex];

          // 如果图层没有图片或没有有效的帧索引，则跳过
          if (
            !layer.images ||
            !layer.images.length ||
            validIndices.length === 0
          ) {
            continue;
          }

          // 从有效帧中选择当前索引对应的帧
          // 如果当前索引超出了有效帧数，则循环使用
          const imageIndex = validIndices[frameIndex % validIndices.length];
          if (imageIndex === undefined || imageIndex < 0) continue;

          const resourceFrame = layer.images[imageIndex];
          if (!resourceFrame || !resourceFrame.image) continue;

          // 获取图像的偏移量并绘制
          const offsetX = resourceFrame.offset[0];
          const offsetY = resourceFrame.offset[1];

          ctx.drawImage(
            resourceFrame.image,
            layer.x + offsetX,
            layer.y + offsetY,
            resourceFrame.size[0],
            resourceFrame.size[1]
          );
        }

        // 在所有图层之上绘制水印
        drawWatermark();

        // 将当前帧添加到GIF，设置copy为true确保每帧都是独立的副本
        gif.addFrame(ctx, {
          delay: speed,
          copy: true,
        });
      }

      // 更新渲染进度
      const renderProgress = endIndex / totalFrames;
      observer.next({
        phase: "rendering",
        progress: renderProgress,
      });

      // 如果还有更多帧要添加，则安排下一批
      if (endIndex < totalFrames) {
        setTimeout(() => addFramesInBatches(endIndex), 0);
      } else {
        // 所有帧都已添加，开始GIF渲染
        setTimeout(() => gif.render(), 0);
      }
    };

    // 开始添加第一批帧
    setTimeout(() => addFramesInBatches(0), 0);
  });
}
