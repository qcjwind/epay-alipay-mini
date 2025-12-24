import { createPage } from '@miniu/data'

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
    // recurringDay: string 是 周期日期
    recurringDay: '',
    days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
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

  // 生成星期数组
  getWeekDays() {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
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
    // operator: string 是 运营商
    // userName: string 是 用户姓名
    // isFromHistoryPanel: boolean 是否来自历史详情面板
    // payMethod: string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    const { phoneNumber, operator, userName, isFromHistoryPanel, payMethod } = query;
    
    this.setData({
      phoneNumber: phoneNumber || '',
      operator: operator || '',
      userName: userName || '',
      // 默认为 false，有值就为 true
      isFromHistoryPanel: !!isFromHistoryPanel,
      payMethod: payMethod || ''
    });
    
    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      isFromHistoryPanel: this.data.isFromHistoryPanel,
      payMethod: this.data.payMethod
    });
  },

  // 频率变化回调
  onFrequencyChange(frequency) {
    // frequency: 'WEEK' | 'MONTH'
    const isMonthly = frequency === 'MONTH';
    
    // 根据频率更新日期选项
    const days = isMonthly ? this.getMonthDays() : this.getWeekDays();
    const defaultDay = isMonthly ? '1' : 'Monday';
    
    this.setData({
      recurringType: frequency, // string 是 周期类型 周：WEEK 月：MONTH
      days: days,
      recurringDay: defaultDay // string 是 周期日期，有默认值
    });
  },

  // 日期变化回调
  onDayChange(day) {
    this.setData({
      recurringDay: day // string 是 周期日期
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
    const params = {
      phoneNumber,
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

