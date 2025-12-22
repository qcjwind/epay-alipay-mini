Page({
  data: {
    selectedFrequency: 'weekly', // 'weekly' | 'monthly'
    selectedDay: 'Monday',
    selectedDayIndex: 0,
    pickerValue: [0], // picker-view 的 value 需要是数组
    showDayPicker: false,
    days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    displayDays: [] // 显示的5条数据
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

  onReady() {
    // Page loaded
  },

  onShow() {
    // Page show
  },

  // 选择充值频率
  selectFrequency(e) {
    const frequency = e.currentTarget.dataset.frequency;
    const isMonthly = frequency === 'monthly';
    
    // 根据频率更新日期选项
    const days = isMonthly ? this.getMonthDays() : this.getWeekDays();
    const defaultDay = isMonthly ? '1' : 'Monday';
    
    this.setData({
      selectedFrequency: frequency,
      days: days,
      selectedDay: defaultDay,
      selectedDayIndex: 0
    });
  },

  // 计算要显示的5条数据
  getDisplayDays(selectedIndex) {
    const days = this.data.days;
    const displayDays = [];
    const startIndex = Math.max(0, selectedIndex - 2);
    const endIndex = Math.min(days.length - 1, selectedIndex + 2);
    
    // 如果选中的索引太靠前，从0开始显示5条
    if (selectedIndex < 2) {
      for (let i = 0; i < Math.min(5, days.length); i++) {
        displayDays.push({
          value: days[i],
          originalIndex: i
        });
      }
    }
    // 如果选中的索引太靠后，显示最后5条
    else if (selectedIndex > days.length - 3) {
      const start = Math.max(0, days.length - 5);
      for (let i = start; i < days.length; i++) {
        displayDays.push({
          value: days[i],
          originalIndex: i
        });
      }
    }
    // 正常情况，显示选中项前后各2条
    else {
      for (let i = startIndex; i <= endIndex; i++) {
        displayDays.push({
          value: days[i],
          originalIndex: i
        });
      }
    }
    
    return displayDays;
  },

  // 显示/隐藏日期选择器
  toggleDayPicker() {
    const show = !this.data.showDayPicker;
    // 打开时，根据当前频率更新日期选项
    if (show) {
      const isMonthly = this.data.selectedFrequency === 'monthly';
      const days = isMonthly ? this.getMonthDays() : this.getWeekDays();
      // 查找当前选中值在新数组中的索引
      const currentDay = this.data.selectedDay;
      let index = days.indexOf(currentDay);
      if (index === -1) {
        index = 0; // 如果找不到，默认选择第一个
      }
      
      this.setData({
        days: days,
        selectedDayIndex: index,
        showDayPicker: show,
        pickerValue: [index]
      });
    } else {
      this.setData({
        showDayPicker: show
      });
    }
  },

  // Picker 滚动变化
  onPickerChange(e) {
    const index = e.detail.value[0];
    this.setData({
      selectedDayIndex: index,
      pickerValue: [index]
    });
  },

  // 选择日期项
  selectDayItem(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    this.setData({
      selectedDayIndex: index
    });
  },

  // 确认选择
  confirmDaySelect() {
    const selectedDay = this.data.days[this.data.selectedDayIndex];
    this.setData({
      selectedDay: selectedDay,
      showDayPicker: false
    });
  },

  // 继续按钮
  handleContinue() {
    const { selectedFrequency, selectedDay } = this.data;
    console.log('Continue with:', { frequency: selectedFrequency, day: selectedDay });
    
    // TODO: 处理继续逻辑
    my.showToast({
      content: `已选择：${selectedFrequency === 'weekly' ? '每周' : '每月'} ${selectedDay}`,
      duration: 2000
    });
  }
});

