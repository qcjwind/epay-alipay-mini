// Non type tools

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

// 星期名称和数字的映射
const WEEK_DAY_MAP = {
  'MONDAY': '1',
  'TUESDAY': '2',
  'WEDNESDAY': '3',
  'THURSDAY': '4',
  'FRIDAY': '5',
  'SATURDAY': '6',
  'SUNDAY': '7'
};

const WEEK_DAY_REVERSE_MAP = {
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