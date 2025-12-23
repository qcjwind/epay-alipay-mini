Component({
  props: {
    // 频率选项配置
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
    // 当前选中的频率
    selectedFrequency: 'weekly',
    // 日期选择标签
    dayLabel: 'Select day',
    // 日期选项数组
    dayOptions: [],
    // 当前选中的日期
    selectedDay: '',
    // 继续按钮文本
    continueButtonText: 'CONTINUE',
    // 是否显示继续按钮
    showContinueButton: true,
    // 频率变化回调
    onFrequencyChange() {},
    // 日期变化回调
    onDayChange() {},
    // 继续按钮回调
    onContinue() {}
  },

  data: {
    selectedDayIndex: 0,
    showDayPicker: false,
    currentDayOptions: []
  },

  observers: {
    'dayOptions, selectedDay'(dayOptions, selectedDay) {
      if (dayOptions) {
        const index = dayOptions.indexOf(selectedDay);
        this.setData({
          selectedDayIndex: index >= 0 ? index : 0,
          currentDayOptions: dayOptions
        });
      }
    }
  },

  methods: {
    // 选择充值频率
    handleFrequencySelect(e) {
      const frequency = e.currentTarget.dataset.frequency;
      if (this.props.onFrequencyChange) {
        this.props.onFrequencyChange(frequency);
      }
    },

    // 显示/隐藏日期选择器
    toggleDayPicker() {
      const show = !this.data.showDayPicker;
      if (show) {
        const dayOptions = this.props.dayOptions || [];
        const currentDay = this.props.selectedDay;
        const index = dayOptions.indexOf(currentDay);
        this.setData({
          selectedDayIndex: index >= 0 ? index : 0,
          currentDayOptions: dayOptions,
          showDayPicker: show
        });
      } else {
        this.setData({
          showDayPicker: show
        });
      }
    },

    // 选择日期项
    onDaySelect(index) {
      this.setData({
        selectedDayIndex: index
      });
    },

    // 确认选择
    confirmDaySelect(index) {
      const selectedDay = this.data.currentDayOptions[index];
      this.setData({
        showDayPicker: false
      });
      if (this.props.onDayChange) {
        this.props.onDayChange(selectedDay);
      }
    },

    // 继续按钮
    handleContinue() {
      if (this.props.onContinue) {
        this.props.onContinue({
          frequency: this.props.selectedFrequency,
          day: this.props.selectedDay
        });
      }
    }
  }
});

