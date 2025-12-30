Component({
  props: {
    // 频率选项配置
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
    ],
    // 当前选中的频率
    selectedFrequency: 'WEEK',
    // 日期选择标签
    dayLabel: 'Select day',
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
    currentDayOptions: [],
    // 星期选项
    weekOptions: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    // 月份日期选项（1-28）
    monthOptions: Array.from({ length: 28 }, (_, i) => String(i + 1))
  },

  observers: {
    'selectedFrequency'(selectedFrequency) {
      // 当频率变化时，自动更新日期选项
      this.updateDayOptions();
    },
    'selectedDay'(selectedDay) {
      // 当选中日期变化时，更新索引
      this.updateDayIndex();
    }
  },

  didMount() {
    // 组件挂载时初始化日期选项
    this.updateDayOptions();
  },

  didUpdate(prevProps) {
    // 当 props 变化时，更新日期选项
    if (prevProps.selectedFrequency !== this.props.selectedFrequency) {
      this.updateDayOptions();
    }
  },

  methods: {
    // 根据频率更新日期选项
    updateDayOptions() {
      const { selectedFrequency, selectedDay, onDayChange } = this.props;
      
      // 如果频率为空，不更新日期选项
      if (!selectedFrequency) {
        return;
      }
      
      const { weekOptions, monthOptions } = this.data;
      const dayOptions = selectedFrequency === 'WEEK' ? weekOptions : monthOptions;
      
      // 更新当前日期选项
      this.setData({
        currentDayOptions: dayOptions
      });
      
      // 检查当前选中的日期是否在新的选项列表中
      // 如果是周，需要将数字转换为星期名称来检查
      let dayToCheck = selectedDay;
      if (selectedFrequency === 'WEEK' && selectedDay) {
        const numberToWeekMap = {
          '1': 'MONDAY',
          '2': 'TUESDAY',
          '3': 'WEDNESDAY',
          '4': 'THURSDAY',
          '5': 'FRIDAY',
          '6': 'SATURDAY',
          '7': 'SUNDAY'
        };
        dayToCheck = numberToWeekMap[String(selectedDay)] || selectedDay;
      }
      
      if (selectedDay && !dayOptions.includes(dayToCheck)) {
        const defaultDay = dayOptions[0];
        // 通过回调通知父组件更新 selectedDay
        // 如果是周，需要将星期名称转换为数字
        if (onDayChange) {
          let defaultDayValue = defaultDay;
          if (selectedFrequency === 'WEEK') {
            const weekDayMap = {
              'MONDAY': '1',
              'TUESDAY': '2',
              'WEDNESDAY': '3',
              'THURSDAY': '4',
              'FRIDAY': '5',
              'SATURDAY': '6',
              'SUNDAY': '7'
            };
            defaultDayValue = weekDayMap[defaultDay] || defaultDay;
          }
          onDayChange(defaultDayValue);
        }
        // 立即更新索引，因为日期已经改变
        this.setData({
          selectedDayIndex: 0
        });
      } else {
        // 更新日期索引
        this.updateDayIndex();
      }
    },

    // 更新日期索引
    updateDayIndex() {
      const { selectedDay, selectedFrequency } = this.props;
      const { currentDayOptions } = this.data;
      
      // 如果是周，需要将数字转换为星期名称来查找索引
      let dayToFind = selectedDay;
      if (selectedFrequency === 'WEEK') {
        const numberToWeekMap = {
          '1': 'MONDAY',
          '2': 'TUESDAY',
          '3': 'WEDNESDAY',
          '4': 'THURSDAY',
          '5': 'FRIDAY',
          '6': 'SATURDAY',
          '7': 'SUNDAY'
        };
        dayToFind = numberToWeekMap[String(selectedDay)] || selectedDay;
      }
      
      const index = currentDayOptions.indexOf(dayToFind);
      this.setData({
        selectedDayIndex: index >= 0 ? index : 0
      });
    },

    // 选择充值频率
    handleFrequencySelect(e) {
      const frequency = e.currentTarget.dataset.frequency;
      if (this.props.onFrequencyChange) {
        this.props.onFrequencyChange(frequency);
      }
    },

    // 显示/隐藏日期选择器
    toggleDayPicker() {
      // 如果频率为空，不允许打开日期选择器
      if (!this.props.selectedFrequency) {
        return;
      }
      
      const show = !this.data.showDayPicker;
      if (show) {
        // 确保日期选项是最新的
        this.updateDayOptions();
        this.setData({
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
      const { selectedFrequency } = this.props;
      const selectedDay = this.data.currentDayOptions[index];
      this.setData({
        showDayPicker: false
      });
      if (this.props.onDayChange) {
        // 如果是周，需要将星期名称转换为数字（1-7）
        let dayValue = selectedDay;
        if (selectedFrequency === 'WEEK') {
          // 星期名称转换为数字
          const weekDayMap = {
            'MONDAY': '1',
            'TUESDAY': '2',
            'WEDNESDAY': '3',
            'THURSDAY': '4',
            'FRIDAY': '5',
            'SATURDAY': '6',
            'SUNDAY': '7'
          };
          dayValue = weekDayMap[selectedDay] || selectedDay;
        }
        this.props.onDayChange(dayValue);
      }
    },

    // 继续按钮
    handleContinue() {
      if (this.props.onContinue) {
        const { selectedFrequency, selectedDay } = this.props;
        // 如果是周，需要将星期名称转换为数字（接口需要）
        let dayValue = selectedDay;
        if (selectedFrequency === 'WEEK') {
          const weekDayMap = {
            'MONDAY': '1',
            'TUESDAY': '2',
            'WEDNESDAY': '3',
            'THURSDAY': '4',
            'FRIDAY': '5',
            'SATURDAY': '6',
            'SUNDAY': '7'
          };
          dayValue = weekDayMap[selectedDay] || selectedDay;
        }
        
        this.props.onContinue({
          frequency: selectedFrequency,
          day: dayValue
        });
      }
    }
  }
});

