import { createPage } from '@miniu/data'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    userInfo: {
      avatar: '',
      name: 'Amelia Rossi',
      phone: '+39 3421234678'
    },
    operator: 'Vodafone',
    amount: '50',
    recurringText: 'Weekly - on Monday',
    avatarInitials: '',
    // 金额选择器相关
    amountPickerVisible: false,
    amountOptions: ['5', '10', '20', '30', '50', '100', '200', '500'],
    selectedAmountIndex: 4, // 默认选中 50
    // 定期充值选择器相关
    recurringPickerVisible: false,
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
    ],
    selectedFrequency: 'weekly',
    weekOptions: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    monthOptions: Array.from({ length: 28 }, (_, i) => String(i + 1)),
    dayOptions: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    selectedDay: 'Monday'
  },

  onLoad(query) {
    console.info('Confirm top up page onLoad with query:', JSON.stringify(query));
    // 计算首字母
    this.calculateInitials();
    // TODO: 从query或全局状态获取数据
  },

  // 计算姓名首字母
  calculateInitials() {
    const { name } = this.data.userInfo;
    if (!name) {
      this.setData({ avatarInitials: '' });
      return;
    }
    
    const parts = name.trim().split(/\s+/);
    let initials = '';
    
    if (parts.length >= 2) {
      // 如果有多个单词，取第一个和最后一个的首字母
      initials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    } else if (parts.length === 1) {
      // 如果只有一个单词，取前两个字符
      initials = parts[0].substring(0, 2).toUpperCase();
    }
    
    this.setData({ avatarInitials: initials });
  },

  // 修改用户信息
  handleChangeUser() {
    console.log('Change user');
    // TODO: 跳转到用户选择页面
  },

  // 修改运营商
  handleChangeOperator() {
    console.log('Change operator');
    // TODO: 跳转到运营商选择页面
  },

  // 修改金额
  handleChangeAmount() {
    console.log('Change amount');
    // 找到当前金额在选项中的索引
    const { amount, amountOptions } = this.data;
    const currentIndex = amountOptions.indexOf(amount);
    this.setData({
      amountPickerVisible: true,
      selectedAmountIndex: currentIndex >= 0 ? currentIndex : 0
    });
  },

  // 关闭金额选择器
  handleAmountPickerClose() {
    this.setData({
      amountPickerVisible: false
    });
  },

  // 确认选择金额
  handleAmountPickerConfirm(index) {
    const { amountOptions } = this.data;
    const selectedAmount = amountOptions[index];
    this.setData({
      amount: selectedAmount,
      amountPickerVisible: false
    });
    console.log('Selected amount:', selectedAmount);
  },

  // 修改定期充值
  handleChangeRecurring() {
    console.log('Change recurring');
    // 解析当前 recurringText 来设置初始值
    const { recurringText } = this.data;
    let frequency = 'weekly';
    let day = 'Monday';
    
    if (recurringText) {
      if (recurringText.includes('Weekly')) {
        frequency = 'weekly';
        const dayMatch = recurringText.match(/on (\w+)/);
        if (dayMatch) {
          day = dayMatch[1];
        }
      } else if (recurringText.includes('Monthly')) {
        frequency = 'monthly';
        const dayMatch = recurringText.match(/on (\w+)/);
        if (dayMatch) {
          day = dayMatch[1];
        }
      }
    }
    
    // 根据频率设置对应的日期选项
    const { weekOptions, monthOptions } = this.data;
    const dayOptions = frequency === 'weekly' ? weekOptions : monthOptions;
    
    // 确保选中的日期在新的选项列表中，如果不在则使用第一个
    let validDay = day;
    if (!dayOptions.includes(day)) {
      validDay = dayOptions[0];
    }
    
    this.setData({
      recurringPickerVisible: true,
      selectedFrequency: frequency,
      dayOptions: dayOptions,
      selectedDay: validDay
    });
  },

  // 关闭定期充值选择器
  handleRecurringPickerClose() {
    this.setData({
      recurringPickerVisible: false
    });
  },

  // 频率变化
  handleFrequencyChange(frequency) {
    const { weekOptions, monthOptions } = this.data;
    const newDayOptions = frequency === 'weekly' ? weekOptions : monthOptions;
    this.setData({
      selectedFrequency: frequency,
      dayOptions: newDayOptions,
      // 切换频率时重置日期为第一个选项
      selectedDay: newDayOptions[0]
    });
  },

  // 日期变化
  handleDayChange(day) {
    this.setData({
      selectedDay: day
    });
  },

  // 确认定期充值设置
  handleRecurringContinue({ frequency, day }) {
    const frequencyText = frequency === 'weekly' ? 'Weekly' : 'Monthly';
    const recurringText = `${frequencyText} - on ${day}`;
    
    this.setData({
      recurringText: recurringText,
      recurringPickerVisible: false
    });
    
    console.log('Selected recurring:', recurringText);
  },

  // 确认按钮
  handleContinue() {
    console.log('Confirm button clicked');
    // TODO: 处理确认逻辑
  }
}));

