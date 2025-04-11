import { md5 } from "./forge";
import {
  getFileNameWithoutExtension,
  GetTransferEntries,
  readFileAsDataURL,
  readFileAsString,
  Transfer,
} from "./file-system";
import { ActType, ResourceConfig } from "../models/act";

export interface ResourceFrame {
  size: [number, number];
  offset: [number, number];
  image: HTMLImageElement;
}

function isImageFile(file: Transfer): file is File {
  return "type" in file && file.type.startsWith("image/");
}

export interface LayerInfo {
  id: string;
  name: string;
  images: ResourceFrame[];
  w: number;
  h: number;
  matrix: boolean[][];
  config: ResourceConfig;
}

/**
 * Sort files in natural order (for frame sequences)
 * @param files Array of files to sort
 * @returns Sorted array of files
 */
function sortFilesByName(files: Transfer[]): Transfer[] {
  return [...files].sort((a, b) => {
    // Natural sort that handles numbers in filenames properly
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    return aName.localeCompare(bName, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

export async function TransferListToLayers(
  list: DataTransferItemList
): Promise<LayerInfo[]> {
  const files = await GetTransferEntries(list);
  const layers: LayerInfo[] = [];

  // Process all top-level items, not just the first one
  for (const item of files) {
    if ("children" in item) {
      // Process directory
      const layersFromDir = await processDirectory(item, item.name);
      layers.push(...layersFromDir);
    } else if (isImageFile(item)) {
      // Process individual image file
      const resourceFrame = await FileToResourceFrame(item);
      const imageData = getImageDimensions(resourceFrame.image);

      layers.push({
        id: md5(`${item.name}-${Math.random().toString().slice(2)}`),
        name: item.name,
        images: [resourceFrame],
        w: imageData.width,
        h: imageData.height,
        matrix: imageData.matrix,
        config: {
          Type: ActType.None,
          Actions: [],
        },
      });
    }
  }

  return layers;
}

/**
 * Process a directory to extract all image resources and create layers
 * @param directory The directory to process
 * @param basePath The base path for naming
 * @returns Array of LayerInfo objects
 */
async function processDirectory(
  directory: Transfer,
  basePath: string
): Promise<LayerInfo[]> {
  if (!("children" in directory)) {
    return [];
  }

  const layers: LayerInfo[] = [];

  // First, check if there's a Placements folder and extract offset information
  const Placements = directory.children.find(
    (item) => item.name === "Placements"
  );
  const hasPlacementsFolder = Placements && "children" in Placements;

  // Process placements data if the folder exists
  const placementsOffsets = new Map<string, [number, number]>();
  if (hasPlacementsFolder && "children" in Placements) {
    // Sort placement files to ensure consistent processing order
    const sortedPlacementFiles = sortFilesByName(Placements.children);

    for await (const item of sortedPlacementFiles) {
      if ("children" in item) {
        continue;
      }
      const content = await readFileAsString(item);
      const offset = content
        .split("\r\n")
        .slice(0, 2)
        .map((line) => Number.parseInt(line.trim())) as [number, number];

      // We only care about non-zero offsets (same logic as in LoadImageResources)
      const isNonZeroOffset = !offset.every((value) => value === 0);
      if (isNonZeroOffset) {
        placementsOffsets.set(getFileNameWithoutExtension(item.name), offset);
      }
    }
  }

  // Process all images in this directory based on placements data
  const currentDirImages: {
    file: File;
    offset: [number, number];
    name: string;
  }[] = [];

  // Sort directory children to ensure consistent order
  const sortedChildren = sortFilesByName(directory.children);

  // Process all children of the directory
  for (const child of sortedChildren) {
    if ("children" in child) {
      // Skip the Placements folder, as we already processed it
      if (child.name === "Placements") continue;

      // Recursively process nested directories
      const nestedLayers = await processDirectory(
        child,
        `${basePath}/${child.name}`
      );
      layers.push(...nestedLayers);
    } else if (isImageFile(child)) {
      // For image files within this directory
      const fileName = getFileNameWithoutExtension(child.name);

      // If Placements folder exists, only include images with placement data
      // Otherwise include all images
      if (hasPlacementsFolder) {
        if (placementsOffsets.has(fileName)) {
          // Get offset for this file from placements data
          const offset = placementsOffsets.get(fileName)!;
          currentDirImages.push({ file: child, offset, name: child.name });
        }
      } else {
        // No Placements folder, include all images with zero offset
        currentDirImages.push({
          file: child,
          offset: [0, 0],
          name: child.name,
        });
      }
    }
  }

  // If we have images in this directory, create a layer for them
  if (currentDirImages.length > 0) {
    // Convert the sorted images to ResourceFrames
    const frames = await Promise.all(
      currentDirImages.map((item) =>
        FileToResourceFrame(item.file, item.offset)
      )
    );

    if (frames.length > 0) {
      const firstImageData = getImageDimensions(frames[0].image);

      layers.push({
        id: md5(`${basePath}-${Math.random().toString().slice(2)}`),
        name: basePath, // Use the full path as the name to show hierarchy
        images: frames,
        w: firstImageData.width,
        h: firstImageData.height,
        matrix: firstImageData.matrix,
        config: {
          Type: ActType.None,
          Actions: [],
        },
      });
    }
  }

  return layers;
}

async function FileToResourceFrame(
  file: File,
  offset: [number, number] = [0, 0]
): Promise<ResourceFrame> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        size: [img.width, img.height],
        offset,
        image: img,
      });
    };
    img.onerror = (error) => {
      reject(error);
    };
    readFileAsDataURL(file)
      .then((url) => {
        img.src = url;
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function LoadImageResources(list: Transfer[]): Promise<ResourceFrame[]> {
  const Placements = list.find((item) => item.name === "Placements");
  if (!Placements || !("children" in Placements)) {
    // Sort image files before processing
    const sortedList = sortFilesByName(list);

    // If no Placements folder, return all image files in sorted order
    return Promise.all(
      sortedList.reduce<Promise<ResourceFrame>[]>((acc, item) => {
        if (isImageFile(item)) {
          acc.push(FileToResourceFrame(item));
        }
        return acc;
      }, [])
    );
  }

  const keep = new Map<string, [number, number]>();
  // Sort placement files before processing
  const sortedPlacementChildren = sortFilesByName(Placements.children);

  for await (const item of sortedPlacementChildren) {
    if ("children" in item) {
      continue;
    }
    const content = await readFileAsString(item);
    const offset = content
      .split("\r\n")
      .slice(0, 2)
      .map((line) => Number.parseInt(line.trim())) as [number, number];
    const isValid = !offset.every((line) => line === 0);
    if (isValid) {
      keep.set(getFileNameWithoutExtension(item.name), offset);
    }
  }

  // Sort list before processing to ensure frames are in correct order
  const sortedList = sortFilesByName(list);
  const framePromises: Promise<ResourceFrame>[] = [];

  for (const item of sortedList) {
    const fileName = getFileNameWithoutExtension(item.name);
    if (isImageFile(item) && keep.has(fileName)) {
      framePromises.push(FileToResourceFrame(item, keep.get(fileName)));
    } else if (isImageFile(item) && !Placements) {
      // Include all images if no Placements folder exists
      framePromises.push(FileToResourceFrame(item));
    }
  }

  return Promise.all(framePromises);
}

/**
 * 获取图片的尺寸和透明通道信息
 * @param imageUrl 图片的DataURL
 * @returns 包含宽度、高度和透明通道矩阵的对象
 */
function getImageDimensions(img: HTMLImageElement): {
  width: number;
  height: number;
  matrix: boolean[][];
} {
  const width = img.width;
  const height = img.height;
  // 创建一个canvas用于分析图片数据
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    // 如果无法获取context，返回默认值
    return { width, height, matrix: [] };
  }

  // 绘制图片到canvas
  ctx.drawImage(img, 0, 0);

  // 分析图片像素获取透明度信息
  const imageData = ctx.getImageData(0, 0, width, height);
  const matrix: boolean[][] = [];

  // 对于较大的图片，可以采样分析而不是逐像素分析

  for (let y = 0; y < height; y += 1) {
    matrix[y] = [];
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      // 检查像素的alpha值，0表示完全透明
      const alpha = imageData.data[index + 3];
      matrix[y][x] = alpha > 0;
    }
  }

  return { width, height, matrix };
}
