import { v4 as uuidv4 } from 'uuid';

/**
 * 生成UUID v4
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  return uuidv4();
}

/**
 * 生成UUID v4（别名，方便使用）
 * @returns {string} UUID字符串
 */
export function uuid() {
  return uuidv4();
}

