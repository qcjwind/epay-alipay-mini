Page({
  data: {
    // 页面接收的参数
    phoneNumber: '', // string 是 充值号码
    operator: '', // string 是 运营商
    userName: '', // string 是 用户姓名
    isFromHistoryPanel: false, // boolean 是否来自历史详情面板
    
    // 定期充值相关
    // recurringType: string 是 周期类型 周：WEEK 月：MONTH
    recurringType: 'WEEK', // 'WEEK' | 'MONTH'
    // recurringDay: string 是 周期日期
    recurringDay: 'Monday',
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
    const { phoneNumber, operator, userName, isFromHistoryPanel } = query;
    
    this.setData({
      phoneNumber: phoneNumber || '',
      operator: operator || '',
      userName: userName || '',
      // 默认为 false，有值就为 true
      isFromHistoryPanel: !!isFromHistoryPanel
    });
    
    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      isFromHistoryPanel: this.data.isFromHistoryPanel
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
      recurringDay: defaultDay // string 是 周期日期
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
      recurringDay      // string 是 周期日期
    } = this.data;
    
    console.log('Continue with:', { 
      phoneNumber,
      operator,
      userName,
      isFromHistoryPanel,
      recurringType,
      recurringDay
    });
    
    // 构建参数对象
    const params = {
      phoneNumber,
      operator,
      userName,
      recurringType,
      recurringDay
    };
    
    // 将参数对象转换为 URL 查询字符串
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '') // 过滤空值
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    // 根据 isFromHistoryPanel 决定跳转页面
    if (isFromHistoryPanel) {
      // 来自历史详情面板，跳转到确认充值页面
      // 添加 payMethod 参数，标识为定期充值
      const confirmParams = {
        ...params,
        payMethod: 'recurring' // string 是 充值方式 recurring: 定期充值
      };
      const confirmQueryString = Object.keys(confirmParams)
        .filter(key => confirmParams[key] !== undefined && confirmParams[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(confirmParams[key])}`)
        .join('&');
      
      my.navigateTo({
        url: `/pages/confirm-top-up/confirm-top-up?${confirmQueryString}`
      });
    } else {
      // 否则跳转到选择金额页面
      my.navigateTo({
        url: `/pages/choose-amount/choose-amount?${queryString}`
      });
    }
  }
});

