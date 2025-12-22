Page({
  data: {
    selectedFrequency: 'weekly', // 'weekly' | 'monthly'
    selectedDay: 'Monday',
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
        value: 'weekly',
        label: 'Weekly Top-up',
        icon: '/assets/icons/weekly.png'
      },
      {
        value: 'monthly',
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
  },

  // 频率变化回调
  onFrequencyChange(frequency) {
    const isMonthly = frequency === 'monthly';
    
    // 根据频率更新日期选项
    const days = isMonthly ? this.getMonthDays() : this.getWeekDays();
    const defaultDay = isMonthly ? '1' : 'Monday';
    
    this.setData({
      selectedFrequency: frequency,
      days: days,
      selectedDay: defaultDay
    });
  },

  // 日期变化回调
  onDayChange(day) {
    this.setData({
      selectedDay: day
    });
  },

  // 继续按钮
  handleContinue(data) {
    const { frequency, day } = data;
    console.log('Continue with:', { frequency, day });
    
    // TODO: 处理继续逻辑
    my.showToast({
      content: `已选择：${frequency === 'weekly' ? '每周' : '每月'} ${day}`,
      duration: 2000
    });
  }
});

