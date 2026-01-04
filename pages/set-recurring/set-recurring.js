import { createPage } from '@miniu/data'
import { numberToWeekDay, weekDayToNumber } from '../../utils/util'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    // 页面接收的参数
    phoneNumber: '', // string 是 充值号码
    operator: '', // string 是 运营商
    userName: '', // string 是 用户姓名
    isFromHistoryPanel: false, // boolean 是否来自历史详情面板
    payMethod: '', // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    
    // 定期充值相关
    // recurringType: string 是 周期类型 周：WEEK 月：MONTH
    recurringType: '', // 'WEEK' | 'MONTH' | ''
    // recurringDay: string 是 周期日期（存储值：周为数字 1-7，月为 1-28）
    recurringDay: '',
    // displayRecurringDay: string 用于显示的周期日期（周为星期名称 MONDAY-SUNDAY，月为 1-28）
    displayRecurringDay: '',
    days: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY'
    ],
    frequencyOptions: [
      {
        value: 'WEEK',
        label: 'Weekly Top-up',
        icon: '/assets/icons/weekly.png'
      },
      {
        value: 'MONTH',
        label: 'Monthly Top-up',
        icon: '/assets/icons/monthly.png'
      }
    ]
  },

  // 生成星期数组（1=SUNDAY, 2=MONDAY, ..., 7=SATURDAY）
  getWeekDays() {
    return [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ];
  },

  // 生成日期数组（1-28）
  getMonthDays() {
    const days = [];
    for (let i = 1; i <= 28; i++) {
      days.push(String(i));
    }
    return days;
  },

  onLoad(query) {
    console.info('Set recurring page onLoad with query:', JSON.stringify(query));
    
    // 接收页面参数
    // phoneNumber: string 是 充值号码
    // phonePrefix: string 否 电话前缀
    // operator: string 是 运营商
    // userName: string 是 用户姓名
    // isFromHistoryPanel: boolean 是否来自历史详情面板
    // payMethod: string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    // recurringType: string 否 周期类型
    // recurringDay: string 否 周期日期（可能是数字 1-7 或星期名称）
    const { phoneNumber, phonePrefix, operator, userName, isFromHistoryPanel, payMethod, recurringType, recurringDay } = query;
    
    // 处理 recurringDay：如果是数字，转换为星期名称用于显示
    let displayRecurringDay = recurringDay || '';
    let dayValue = recurringDay || '';
    if (recurringType === 'WEEK' && recurringDay) {
      // 如果是周且是数字，转换为星期名称用于显示
      if (/^[1-7]$/.test(String(recurringDay))) {
        displayRecurringDay = numberToWeekDay(recurringDay);
      } else {
        // 如果是星期名称，转换为数字存储
        dayValue = weekDayToNumber(recurringDay);
        displayRecurringDay = recurringDay;
      }
    }
    
    this.setData({
      phoneNumber: phoneNumber || '',
      phonePrefix: phonePrefix || '',
      operator: operator || '',
      userName: userName || '',
      // 默认为 false，有值就为 true
      isFromHistoryPanel: !!isFromHistoryPanel,
      payMethod: payMethod || '',
      recurringType: recurringType || '',
      recurringDay: dayValue || '', // 存储数字值
      displayRecurringDay: displayRecurringDay || '' // 用于显示的星期名称
    });
    
    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      isFromHistoryPanel: this.data.isFromHistoryPanel,
      payMethod: this.data.payMethod,
      recurringType: this.data.recurringType,
      recurringDay: this.data.recurringDay,
      displayRecurringDay: this.data.displayRecurringDay
    });
  },

  // 频率变化回调
  onFrequencyChange(frequency) {
    // frequency: 'WEEK' | 'MONTH'
    const isMonthly = frequency === 'MONTH';
    
    // 根据频率更新日期选项
    const days = isMonthly ? this.getMonthDays() : this.getWeekDays();
    // 默认值：周使用数字 '1' (SUNDAY)，月使用 '1'
    const defaultDay = isMonthly ? '1' : '1';
    // 用于显示的默认值：周使用星期名称，月使用数字
    const defaultDisplayDay = isMonthly ? '1' : numberToWeekDay('1');
    
    this.setData({
      recurringType: frequency, // string 是 周期类型 周：WEEK 月：MONTH
      days: days,
      recurringDay: defaultDay, // string 是 周期日期，有默认值（周为数字 1-7，月为 1-28）
      displayRecurringDay: defaultDisplayDay // 用于显示的日期
    });
  },

  // 日期变化回调
  onDayChange(day) {
    // 如果是周，需要将星期名称转换为数字（接口需要）
    const { recurringType } = this.data;
    let dayValue = day;
    if (recurringType === 'WEEK') {
      dayValue = weekDayToNumber(day);
    }
    
    this.setData({
      recurringDay: dayValue, // string 是 周期日期（周为数字 1-7，月为 1-28）
      displayRecurringDay: day // 用于显示的日期（周为星期名称，月为数字）
    });
  },

  // 继续按钮
  handleContinue() {
    const { 
      phoneNumber,      // string 是 充值号码
      operator,         // string 是 运营商
      userName,         // string 是 用户姓名
      isFromHistoryPanel, // boolean 是否来自历史详情面板
      recurringType,    // string 是 周期类型 周：WEEK 月：MONTH
      recurringDay,     // string 是 周期日期
      payMethod,        // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
      lang
    } = this.data;
    
    // 验证是否选择了定期类型
    if (!recurringType) {
      my.showModal({
        title: lang.setRecurring.modal.title,
        content: lang.setRecurring.modal.content,
        confirmText: lang.setRecurring.modal.button,
        showCancel: false,
      });
      return;
    }
    
    console.log('Continue with:', { 
      phoneNumber,
      operator,
      userName,
      isFromHistoryPanel,
      recurringType,
      recurringDay,
      payMethod
    });
    
    // 构建参数对象
    const { phonePrefix } = this.data;
    const params = {
      phoneNumber,
      phonePrefix, // 透传 phonePrefix
      operator,
      userName,
      recurringType,
      recurringDay,
      payMethod
    };
    
    // 将参数对象转换为 URL 查询字符串
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '') // 过滤空值
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    // 根据 isFromHistoryPanel 决定跳转页面
    if (isFromHistoryPanel) {
      // 来自历史详情面板，跳转到确认充值页面
      my.navigateTo({
        url: `/pages/confirm-top-up/confirm-top-up?${queryString}`
      });
    } else {
      // 否则跳转到选择金额页面
      my.navigateTo({
        url: `/pages/choose-amount/choose-amount?${queryString}`
      });
    }
  }
}));

