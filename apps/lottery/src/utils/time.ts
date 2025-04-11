import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

/**
 * 将时间戳格式化为时间字符串
 * @param timestamp 时间戳（秒）
 * @param pattern 格式化模式，默认为 HH:mm:ss
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  timestamp: number,
  pattern: string = "HH:mm:ss"
): string {
  // 将秒级时间戳转换为毫秒级，然后创建Date对象
  const date = new Date(timestamp * 1000);

  // 使用date-fns的format函数进行格式化，并应用中文locale
  return format(date, pattern, { locale: zhCN });
}

/**
 * 将日期对象格式化为日期时间字符串
 * @param date 日期对象
 * @param pattern 格式化模式，默认为 yyyy-MM-dd HH:mm:ss
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  date: Date,
  pattern: string = "yyyy-MM-dd HH:mm:ss"
): string {
  return format(date, pattern, { locale: zhCN });
}

/**
 * 获取当前时间的格式化字符串
 * @param pattern 格式化模式，默认为 HH:mm:ss
 * @returns 当前时间的格式化字符串
 */
export function getCurrentTime(pattern: string = "HH:mm:ss"): string {
  return formatDateTime(new Date(), pattern);
}
