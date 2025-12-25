/**
 * 生成随机十六进制字符
 * @returns {string} 十六进制字符 (0-9, a-f)
 */
function randomHex() {
  return Math.floor(Math.random() * 16).toString(16);
}

/**
 * 生成UUID v4
 * UUID v4 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 其中：
 * - x 是 0-9 或 a-f 的十六进制数字
 * - 第 13 位必须是 '4'（表示版本 4）
 * - 第 17 位必须是 '8', '9', 'a', 或 'b'（表示变体）
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  // 生成 32 个十六进制字符
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    if (i === 12) {
      // 第 13 位必须是 '4'（版本号）
      uuid += '4';
    } else if (i === 16) {
      // 第 17 位必须是 '8', '9', 'a', 或 'b'（变体）
      const variant = (Math.floor(Math.random() * 4) + 8).toString(16);
      uuid += variant;
    } else {
      uuid += randomHex();
    }
  }
  
  // 格式化为标准 UUID 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return [
    uuid.substring(0, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
    uuid.substring(16, 20),
    uuid.substring(20, 32)
  ].join('-');
}

/**
 * 生成UUID v4（别名，方便使用）
 * @returns {string} UUID字符串
 */
export function uuid() {
  return generateUUID();
}

