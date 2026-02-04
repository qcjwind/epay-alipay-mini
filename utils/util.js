// Non type tools
import dayjs from 'dayjs';
import { uuid } from './uuid';

// Compare version
export function compareVersion(v1, v2) {
  const s1 = v1.split('.');
  const s2 = v2.split('.');
  const len = Math.max(s1.length, s2.length);

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(s1[i] || '0');
    const num2 = parseInt(s2[i] || '0');

    if (num1 > num2) {
      return true;
    } else if (num1 < num2) {
      return false;
    }
  }

  return true;
}

// 缓存系统语言
let cachedLanguage = null;

/**
 * 获取系统语言（带缓存）
 * @returns {string} 系统语言，默认为 'en-US'
 */
export const getLanguage = () => {
  // 如果已缓存，直接返回
  // if (cachedLanguage !== null) {
  //   return cachedLanguage;
  // }
  
  // 首次获取，从系统信息中读取
  try {
    const systemInfo = my.getSystemInfoSync();
    cachedLanguage = systemInfo.language || 'en-US';
    return cachedLanguage;
  } catch (error) {
    console.error('获取系统语言失败:', error);
    cachedLanguage = 'en-US';
    return cachedLanguage;
  }
};

// 星期名称和数字的映射（1=MONDAY, 2=TUESDAY, ..., 7=SUNDAY）
// 星期名称 -> 数字（用于接口传参）
export const WEEK_DAY_MAP = {
  'MONDAY': '1',
  'TUESDAY': '2',
  'WEDNESDAY': '3',
  'THURSDAY': '4',
  'FRIDAY': '5',
  'SATURDAY': '6',
  'SUNDAY': '7'
};

// 数字 -> 星期名称（用于显示）
export const WEEK_DAY_REVERSE_MAP = {
  '1': 'MONDAY',
  '2': 'TUESDAY',
  '3': 'WEDNESDAY',
  '4': 'THURSDAY',
  '5': 'FRIDAY',
  '6': 'SATURDAY',
  '7': 'SUNDAY'
};

// 将星期名称转换为数字（用于接口传参）
// 输入：'MONDAY' -> 输出：'1'
export function weekDayToNumber(weekDay) {
  if (!weekDay) return weekDay;
  // 如果已经是数字，直接返回
  if (/^[1-7]$/.test(String(weekDay))) {
    return String(weekDay);
  }
  return WEEK_DAY_MAP[weekDay.toUpperCase()] || weekDay;
}

// 将数字转换为星期名称（用于显示）
// 输入：'1' -> 输出：'MONDAY'
export function numberToWeekDay(number) {
  if (!number) return number;
  // 如果已经是星期名称，直接返回
  if (WEEK_DAY_MAP[String(number).toUpperCase()]) {
    return String(number).toUpperCase();
  }
  return WEEK_DAY_REVERSE_MAP[String(number)] || number;
}

/**
 * 格式化时间戳为日期字符串（兼容各时区）
 * @param {number|string} timestamp - 时间戳（秒级或毫秒级）
 * @param {string} format - 格式化模板，默认为 'DD.MM.YY, HH.mm'
 * @returns {string} 格式化后的日期字符串
 */
export function formatTimestamp(timestamp, format = 'DD.MM.YY, HH.mm') {
  if (!timestamp) return '';
  
  // 将时间戳转换为数字
  let ts = Number(timestamp);
  
  // 判断是秒级还是毫秒级时间戳（秒级时间戳通常是10位，毫秒级是13位）
  // 如果小于 13 位，认为是秒级，需要转换为毫秒级
  if (ts < 10000000000) {
    ts = ts * 1000;
  }
  
  // 使用 dayjs 格式化，dayjs 会自动使用本地时区
  return dayjs(ts).format(format);
}

/**
 * 格式化时间戳为简短日期字符串（用于列表显示）
 * @param {number|string} timestamp - 时间戳（秒级或毫秒级）
 * @returns {string} 格式化后的日期字符串，格式：'DD.MM.YY, HH.mm'
 */
export function formatDate(timestamp) {
  return formatTimestamp(timestamp, 'DD.MM.YY, HH.mm');
}

/**
 * 格式化时间戳为日期时间字符串（用于详情显示）
 * @param {number|string} timestamp - 时间戳（秒级或毫秒级）
 * @returns {string} 格式化后的日期时间字符串，格式：'DD.MM.YY, HH.mm'
 */
export function formatDateTime(timestamp) {
  return formatTimestamp(timestamp, 'DD.MM.YY, HH.mm');
}

/**
 * 获取用户的当前时区
 * @returns {string} 时区标识符，例如：'Asia/Shanghai', 'America/New_York', 'Europe/London' 等，如果无法获取则返回 UTC 偏移格式如 'UTC+08:00'
 */
export function getUserTimezone() {
  try {
    // 使用 Intl API 获取时区（推荐方式，返回 IANA 时区标识符）
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        return timeZone;
      }
    }
    
    // 降级方案：使用 dayjs 获取时区偏移
    const offset = dayjs().utcOffset(); // dayjs 返回的是分钟偏移，正数表示 UTC+，负数表示 UTC-
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    const offsetString = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    return `UTC${offsetString}`;
  } catch (error) {
    console.error('获取时区失败:', error);
    // 默认返回 UTC
    return 'UTC';
  }
}

// 缓存 clientId
let cachedClientId = null;
const CLIENT_ID_KEY = 'CLIENT_ID';

/**
 * 获取客户端ID（带缓存）
 * 首次获取时生成 UUID 并缓存到本地存储，后续直接从缓存读取
 * @returns {string} 客户端ID（UUID格式）
 */
export function getClientId() {
  // 如果内存中已缓存，直接返回
  if (cachedClientId) {
    return cachedClientId;
  }
  
  try {
    // 尝试从本地存储读取
    const storageResult = my.getStorageSync({
      key: CLIENT_ID_KEY
    });
    
    if (storageResult && storageResult.data) {
      cachedClientId = storageResult.data;
      return cachedClientId;
    }
  } catch (error) {
    // 本地存储读取失败，继续生成新的
    console.warn('读取 clientId 缓存失败:', error);
  }
  
  // 如果本地存储中没有，生成新的 UUID 并缓存
  cachedClientId = uuid();
  
  try {
    // 保存到本地存储
    my.setStorageSync({
      key: CLIENT_ID_KEY,
      data: cachedClientId
    });
  } catch (error) {
    console.error('保存 clientId 失败:', error);
  }
  
  return cachedClientId;
}