import pkg from "node-forge";
const { md } = pkg;

/**
 * 创建一个字符串的MD5哈希
 * @param {string} raw - 要哈希的字符串
 * @returns {string} 哈希后的字符串
 */
export function md5(raw: string): string {
  return md.md5.create().update(raw).digest().toHex();
}
