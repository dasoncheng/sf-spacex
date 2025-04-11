export interface Directory {
  name: string;
  children: Transfer[];
}
export type Transfer = File | Directory;

/**
 * 提取文件名并去除后缀
 * @param fileName 完整的文件名（包含后缀）
 * @returns 去除后缀的文件名
 */
export function getFileNameWithoutExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return fileName; // 如果没有后缀，直接返回原始文件名
  }
  return fileName.substring(0, lastDotIndex);
}

function fileEntryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve) => {
    entry.file(resolve);
  });
}
function directoryEntryToFileSystemEntries(
  entry: FileSystemDirectoryEntry
): Promise<FileSystemEntry[]> {
  return new Promise((resolve) => {
    const directoryReader = entry.createReader();
    const entries: FileSystemEntry[] = [];

    const readEntries = () => {
      directoryReader.readEntries((results) => {
        if (results.length > 0) {
          entries.push(...results);
          readEntries();
        } else {
          resolve(entries);
        }
      });
    };

    readEntries();
  });
}

async function fileSystemEntryToTransfer(
  entry: FileSystemEntry
): Promise<Transfer> {
  if (entry.isFile) {
    return fileEntryToFile(entry as FileSystemFileEntry);
  } else {
    const directory = entry as FileSystemDirectoryEntry;
    const children = await directoryEntryToFileSystemEntries(directory);
    return {
      name: directory.name,
      children: await Promise.all(children.map(fileSystemEntryToTransfer)),
    };
  }
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
export function readFileAsString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function GetTransferEntries(
  list: DataTransferItemList
): Promise<Transfer[]> {
  return Promise.all(
    Array.from(list)
      .map((item) => item.webkitGetAsEntry())
      .filter((entry) => !!entry)
      .map((entry) => fileSystemEntryToTransfer(entry))
  );
}
