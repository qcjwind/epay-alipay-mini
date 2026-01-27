import { createPage } from '@miniu/data'
import { updateRecurringAPI, getFaceValueListAPI, getRecurringAuthUrlAPI, confirmRecurringAgreementAPI, oneTimePayAPI, getOneTimeStatusAPI } from '../../services/topup'
import { notificationAuthAPI } from '../../services/home'
import { numberToWeekDay, weekDayToNumber } from '../../utils/util'

Page(createPage({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  data: {
    // 页面接收的参数（来自选择金额页面）
    phoneNumber: '', // string 是 充值号码
    phonePrefix: '', // string 否 电话前缀
    operator: '', // string 是 运营商
    userName: '', // string 是 用户姓名
    amount: '', // string 是 充值金额
    payMethod: '', // string 是 充值方式 oneTime: 单次充值 recurring: 定期充值
    recurringType: '', // string 否 周期类型 周：WEEK 月：MONTH
    recurringDay: '', // string 否 周期日期
    editRecurring: false, // boolean 否 是否编辑定期充值
    agreementId: '', // string 否 合约ID（编辑时必需）

    // 页面展示数据（基于接收的参数生成）
    recurringText: '',
    avatarInitials: '',

    // 金额选择器相关
    amountPickerVisible: false,
    faceValueList: [], // list<string> 是 充值面额列表（用于显示，faceValue 数组）
    faceValueDataList: [], // 完整的数据对象数组 {amount, currency, faceValue}
    selectedAmountIndex: 0,
    displayAmount: '', // 用于显示的金额（faceValue）

    // 定期充值选择器相关
    recurringPickerVisible: false,
    selectedFrequency: 'WEEK',
    selectedDay: 'MONDAY', // 用于显示的星期名称（组件内部会转换为数字）

    // 防抖相关
    isConfirming: false, // 是否正在确认中，用于防抖
    confirmButtonText: '', // 确认按钮文案（从 i18n 获取）

    // 成功弹窗相关
    successModalVisible: false,
    successModalTitle: '', // 成功弹窗标题
    successModalContent: '', // 成功弹窗内容
    successModalButtonText: '', // 成功弹窗按钮文案
    successModalType: '', // 成功弹窗类型：'oneTime' | 'recurring'

    // 轮询相关
    pollTimer: null, // 轮询定时器
    pollCount: 0, // 轮询次数
    orderId: '', // 订单ID（用于查询支付状态）

    // 异常弹窗相关
    errorModalVisible: false,
    errorModalTitle: '',
    errorModalContent: '',
    errorModalShowRetry: false,
    errorModalOkText: '', // 确定按钮文案
    errorModalRetryText: '', // 重试按钮文案
    errorModalErrorType: 'oneTime' // 错误类型：'oneTime' | 'recurring'
  },

  onLoad(query) {
    console.info('Confirm top up page onLoad with query:', JSON.stringify(query));

    const { phoneNumber, phonePrefix, operator, userName, amount, payMethod, recurringType, recurringDay, editRecurring, agreementId } = query;

    // 组合显示电话号码（phonePrefix + phoneNumber，用空格隔开）
    const displayPhoneNumber = phonePrefix && phoneNumber
      ? `${phonePrefix} ${phoneNumber}`
      : phoneNumber || '';

    // 处理 recurringDay：如果是周，确保存储的是数字（1-7），用于接口传参
    // 显示时会自动转换为星期名称
    let dayValue = recurringDay || '';
    if (recurringType === 'WEEK' && recurringDay) {
      // 如果是星期名称，转换为数字
      if (!/^[1-7]$/.test(String(recurringDay))) {
        dayValue = weekDayToNumber(recurringDay);
      }
    }

    this.setData({
      phoneNumber: phoneNumber || '',
      phonePrefix: phonePrefix || '',
      displayPhoneNumber: displayPhoneNumber, // 用于显示的完整电话号码
      operator: operator || '',
      userName: userName || '',
      amount: amount || '', // amount 值（用于传参）
      payMethod: payMethod || '',
      recurringType: recurringType || '',
      recurringDay: dayValue || '', // 存储数字值（周为 1-7，月为 1-28）
      editRecurring: editRecurring === 'true' || editRecurring === true,
      agreementId: agreementId || '',
      displayAmount: amount || '' // 初始显示值，后续会根据接口数据更新
    });

    // 根据参数生成展示数据
    this.updateDisplayData();

    // 获取充值面额列表
    this.getFaceValueList();

    // 初始化按钮文案
    this.setData({
      confirmButtonText: this.data.lang.confirmTopUp.confirm.confirmButtonText.toUpperCase()
    });

    console.info('Received params:', {
      phoneNumber: this.data.phoneNumber,
      operator: this.data.operator,
      userName: this.data.userName,
      amount: this.data.amount,
      payMethod: this.data.payMethod,
      recurringType: this.data.recurringType,
      recurringDay: this.data.recurringDay,
      editRecurring: this.data.editRecurring,
      agreementId: this.data.agreementId
    });
  },

  // 页面卸载时清理定时器
  onUnload() {
    this.stopPolling();
  },

  // 根据接收的参数更新页面展示数据
  updateDisplayData() {
    const { recurringType, recurringDay } = this.data;

    // 生成定期充值文本
    let recurringText = 'None';
    if (recurringType && recurringDay) {
      const frequencyText = recurringType === 'WEEK' ? 'Weekly' : 'Monthly';
      // 如果是周，将数字转换为星期名称用于显示
      let displayDay = recurringDay;
      if (recurringType === 'WEEK') {
        displayDay = numberToWeekDay(recurringDay);
      }
      recurringText = `${frequencyText} - on ${displayDay}`;
    }

    this.setData({
      recurringText: recurringText
    });

    // 计算首字母
    this.calculateInitials();
  },

  // 获取充值面额列表
  // 接口入参：operator string 是 运营商
  // 接口响应：data array 是 充值面额列表，对象结构 {amount: 500, currency: "EUR", faceValue: "5.00"}
  async getFaceValueList() {
    const { operator } = this.data;

    if (!operator) {
      console.warn('Operator is required to get face value list');
      return;
    }

    console.info('Calling API to get face value list, operator:', operator);

    try {
      const res = await getFaceValueListAPI(operator);
      console.info('API response:', res);

      // 保存完整的数据对象数组
      const data = res.data || [];
      const faceValueList = data.map(item => item.faceValue || '');

      // 根据当前 amount 找到对应的 faceValue 用于显示
      const { amount } = this.data;
      const currentItem = data.find(item => String(item.amount) === String(amount));
      const displayAmount = currentItem ? currentItem.faceValue : amount;

      this.setData({
        faceValueList: faceValueList,
        faceValueDataList: data,
        displayAmount: displayAmount
      });
    } catch (error) {
      console.error('Failed to get face value list:', error);
      // 可以在这里添加错误提示
    }
  },

  // 计算姓名首字母
  calculateInitials() {
    const { userName } = this.data;
    if (!userName) {
      this.setData({ avatarInitials: '' });
      return;
    }

    const parts = userName.trim().split(/\s+/);
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

  // 修改金额
  handleChangeAmount() {
    // 找到当前金额在选项中的索引（根据 amount 值查找）
    const { amount, faceValueDataList } = this.data;
    const currentIndex = faceValueDataList.findIndex(item => String(item.amount) === String(amount));
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
    const { faceValueDataList } = this.data;
    const selectedItem = faceValueDataList[index];
    if (selectedItem) {
      // 使用 amount 值保存，faceValue 用于显示
      this.setData({
        amount: String(selectedItem.amount), // 保存 amount 用于传参
        displayAmount: selectedItem.faceValue, // 保存 faceValue 用于显示
        amountPickerVisible: false
      });
    }
  },

  // 修改定期充值
  handleChangeRecurring() {
    // 使用当前接收到的参数设置初始值
    const { recurringType, recurringDay } = this.data;

    // 如果没有参数，使用默认值
    let frequency = recurringType || 'WEEK';
    let day = recurringDay || '1'; // 默认使用数字 '1' (MONDAY)

    // 如果是周，将数字转换为星期名称用于显示
    if (frequency === 'WEEK') {
      day = numberToWeekDay(day) || 'MONDAY';
    }

    this.setData({
      recurringPickerVisible: true,
      selectedFrequency: frequency,
      selectedDay: day
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
    // 组件内部会自动处理日期选项的切换
    // 这里只需要更新频率，组件会根据频率自动更新日期选项
    this.setData({
      selectedFrequency: frequency
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
    // day 已经是数字（1-7 或 1-28），组件内部已经转换
    // 用于显示的文本（将数字转换为星期名称）
    const displayDay = frequency === 'WEEK' ? numberToWeekDay(day) : day;
    const frequencyText = frequency === 'WEEK' ? 'Weekly' : 'Monthly';
    const recurringText = `${frequencyText} - on ${displayDay}`;

    this.setData({
      recurringType: frequency, // 更新参数
      recurringDay: day, // 保存数字值（用于接口）
      recurringText: recurringText,
      recurringPickerVisible: false
    });

  },

  // 确认按钮（带防抖）
  handleContinue() {
    // 防抖：如果正在处理中，直接返回
    if (this.data.isConfirming) {
      console.log('Confirm request is processing, please wait...');
      return;
    }

    const { lang } = this.data;
    my.confirm({
      title: lang.confirmTopUp.confirm.title,
      content: lang.confirmTopUp.confirm.content,
      confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText,
      cancelButtonText: lang.confirmTopUp.confirm.cancelButtonText,
      success: (res) => {
        if (res.confirm) {
          this.doConfirm();
        }
      }
    });
  },

  // 重置确认按钮状态
  resetConfirmButton() {
    const { lang } = this.data;
    this.setData({
      isConfirming: false,
      confirmButtonText: lang.confirmTopUp.confirm.confirmButtonText.toUpperCase()
    });
  },

  // 显示成功弹窗
  // type: 'recurring' | 'oneTime' 成功类型
  showSuccessModal(type) {
    const { lang } = this.data;

    let title, content, buttonText;

    if (type === 'recurring') {
      title = lang.confirmTopUp.recurringSuccess.title;
      content = lang.confirmTopUp.recurringSuccess.content;
      buttonText = lang.confirmTopUp.recurringSuccess.btn;
    } else if (type === 'oneTime') {
      title = lang.confirmTopUp.oneTimeSuccess.title;
      content = lang.confirmTopUp.oneTimeSuccess.content;
      buttonText = lang.confirmTopUp.oneTimeSuccess.btn;
    } else {
      console.warn('Unknown success modal type:', type);
      return;
    }

    this.resetConfirmButton();
    this.setData({
      successModalVisible: true,
      successModalTitle: title,
      successModalContent: content,
      successModalButtonText: buttonText,
      successModalType: type // 保存类型用于关闭时判断
    });
  },

  // 显示异常弹窗
  // errorType: 'oneTime' | 'recurring' | 'numberInvalid' | 'recurringAlreadyActivated' 错误类型，默认为 'oneTime'
  // customTitle: 自定义标题（可选）
  // customContent: 自定义内容（可选）
  showErrorModal(errorType = 'oneTime', errorModalShowRetry = true, customTitle = null, customContent = null) {
    this.resetConfirmButton();

    const { lang } = this.data;
    // 根据错误类型选择对应的 i18n 配置
    let errorConfig;
    if (errorType === 'recurring') {
      errorConfig = lang.confirmTopUp.recurringError;
    } else if (errorType === 'numberInvalid') {
      errorConfig = lang.confirmTopUp.numberInvalidError;
      // 号码无效错误不显示重试按钮
      errorModalShowRetry = false;
    } else if (errorType === 'recurringAlreadyActivated') {
      errorConfig = lang.confirmTopUp.recurringAlreadyActivatedError;
      // 已激活错误不显示重试按钮
      errorModalShowRetry = false;
    } else {
      errorConfig = lang.confirmTopUp.oneTimeError;
    }

    this.setData({
      errorModalVisible: true,
      errorModalTitle: errorConfig.title,
      errorModalContent: errorConfig.content,
      errorModalShowRetry,
      errorModalOkText: errorConfig.btn,
      errorModalRetryText: errorConfig.retry || '',
      errorModalErrorType: errorType // 保存错误类型用于重试
    });
  },

  // 执行确认操作
  doConfirm() {
    const { lang, payMethod, editRecurring } = this.data;

    // 设置处理中标志，更新按钮文案
    this.setData({
      isConfirming: true,
      confirmButtonText: lang.message.loading_ellipsis.toUpperCase()
    });


    // 根据充值类型调用不同的接口
    if (payMethod === 'recurring') {
      if (editRecurring) {
        this.editRecurringTopUp();
      } else {
        this.createRecurringTopUp();
      }
    } else {
      this.createOneTimeTopUp();
    }
  },

  // 开启周期充值
  async createRecurringTopUp() {
    const {
      phoneNumber,
      phonePrefix,
      operator,
      amount,
      recurringType,
      recurringDay,
      userName
    } = this.data;
    
    // 组合电话号码（phonePrefix + phoneNumber，用空格隔开）
    const phoneNumberWithPrefix = phonePrefix && phoneNumber
      ? `${phonePrefix} ${phoneNumber}`
      : phoneNumber || '';


    try {
      const { faceValueDataList } = this.data;
      const currentItem = faceValueDataList.find(item => String(item.amount) === String(amount));
      const currency = currentItem.currency

      const agreedAmount = {
        currency: currency,
        value: amount
      };

      // 调用接口获取签约链接
      const authUrlRes = await getRecurringAuthUrlAPI({
        agreedAmount,
        phoneNumber: phoneNumberWithPrefix,
        recurringType,
        recurringDay,
      });

      const { contractStatus, authUrl } = authUrlRes.data;

      // 根据签约状态决定流程
      if (contractStatus === 'VALID') {
        // 签约有效，直接调用后续签约接口
        try {
          const confirmRes = await confirmRecurringAgreementAPI({
            phoneNumber: phoneNumberWithPrefix,
            phoneUserName: userName,
            operator,
            amount,
            recurringType,
            recurringDay
            // VALID 状态不需要 authCode
          });

          // 根据状态码判断是否已激活
          if (+confirmRes.code === 10003) {
            this.showErrorModal('recurringAlreadyActivated');
            return;
          }

          // 接口成功后显示成功弹窗
          this.showSuccessModal('recurring');
        } catch (error) {
          console.error('Confirm recurring agreement error:', error);
          this.showErrorModal('recurring');
        }
      } else if (contractStatus === 'INVALID') {
        // 签约无效，返回 authUrl 拉起签约页面
        if (!authUrl) {
          throw new Error('Auth URL is empty');
        }

        my.call("customSignContract", {
          authUrl,
          success: async (res) => {

            try {
              // 调用开启周期充值接口
              const confirmRes = await confirmRecurringAgreementAPI({
                phoneNumber: phoneNumberWithPrefix,
                phoneUserName: userName,
                operator,
                amount,
                recurringType,
                recurringDay,
                authCode: res.authCode
              });

              // 根据状态码判断是否已激活
              if (+confirmRes.code === 10003) {
                this.showErrorModal('recurringAlreadyActivated');
                return;
              }

              // 接口成功后显示成功弹窗
              this.showSuccessModal('recurring');
            } catch (error) {
              console.error('Confirm recurring agreement error:', error);
              this.showErrorModal('recurring');
            }
          },
          fail: (res) => {
            console.error('Sign contract fail:', res);
            this.showErrorModal('recurring');
          }
        });
      } else {
        throw new Error(`Unknown contract status: ${contractStatus}`);
      }
    } catch (error) {
      console.error('Get auth URL error:', error);
      this.showErrorModal('recurring');
    }
  },

  // 编辑周期充值（不需要签约）
  editRecurringTopUp() {
    const {
      agreementId,
      amount,
      recurringType,
      recurringDay
    } = this.data;


    // 验证必要参数
    if (!agreementId) {
      this.showErrorModal('recurring');
      return;
    }

    // 调用编辑接口
    updateRecurringAPI({
      agreementId,
      amount,
      recurringType,
      recurringDay
    }).then((res) => {
      // 接口成功后显示成功弹窗
      this.showSuccessModal('recurring');
    }).catch((error) => {
      console.error('Edit recurring error:', error);
      this.showErrorModal('recurring');
    });
  },

  // 单次充值
  async createOneTimeTopUp() {
    const {
      phoneNumber,
      phonePrefix,
      operator,
      amount,
      userName
    } = this.data;
    
    // 组合电话号码（phonePrefix + phoneNumber，用空格隔开）
    const phoneNumberWithPrefix = phonePrefix && phoneNumber
      ? `${phonePrefix} ${phoneNumber}`
      : phoneNumber || '';

    try {
      my.showLoading({
        content: 'Paying...'
      });

      // 获取授权码并通知授权
      await new Promise((resolve) => {
        my.getAuthCode({
          scopes: ['NOTIFICATION_INBOX'],
          success: async (res) => {
            try {
              // 调用通知授权接口
              await notificationAuthAPI(res.authCode);
              resolve();
            } catch (error) {
              console.error('Notification auth error:', error);
              // 通知授权失败不影响后续流程，继续执行
              resolve();
            }
          },
          fail: (res) => {
            console.error('Get auth code fail:', res);
            // 获取授权码失败不影响后续流程，继续执行
            resolve();
          },
        });
      });

      const { faceValueDataList } = this.data;
      const currentItem = faceValueDataList.find(item => String(item.amount) === String(amount));
      const currency = currentItem.currency

      // 调用单次充值接口，获取 paymentId 和 orderId
      const payRes = await oneTimePayAPI({
        phoneNumber: phoneNumberWithPrefix,
        phoneUserName: userName,
        operator,
        amount,
        currency
      });

      // 根据状态码判断是否为手机号非法
      if (+payRes.code === 10301) {
        my.hideLoading();
        this.showErrorModal('numberInvalid');
        return;
      }

      const { paymentId, orderId, redirectUrl } = payRes.data;

      if (!paymentId) {
        throw new Error('Payment ID is empty');
      }

      // 保存 orderId 用于后续查询状态
      this.setData({
        orderId: orderId || ''
      });

      my.hideLoading();

      // 使用 paymentId 作为 tradeNO 调用支付
      my.tradePay({
        tradeNO: paymentId,
        paymentUrl: redirectUrl,
        success: (res) => {
          if (res.resultCode === '9000') {
            // 启动轮询查询支付状态（使用 orderId）
            this.startPollingPaymentStatus(orderId);
          } else if (res.resultCode === '4000' || res.resultCode === '6002') {
            // 支付失败，显示异常弹窗
            this.showErrorModal();
          } else {
            this.resetConfirmButton();
          }
        },
        fail: (res) => {
          console.error('tradePay fail:', res);
          // 支付失败，显示异常弹窗
          this.showErrorModal();
        }
      });
    } catch (error) {
      console.error('One time pay API error:', error);
      my.hideLoading();
      this.showErrorModal();
    }
  },

  // 关闭成功弹窗
  handleSuccessModalClose() {
    const { successModalType } = this.data;
    
    this.setData({
      successModalVisible: false
    });

    // 跳转到历史充值页面
    my.reLaunch({
      url: successModalType === 'oneTime' ? '/pages/history/index?currentKey=topUp' : '/pages/history/index?currentKey=recurring'
    });
  },

  // 开始轮询支付状态
  startPollingPaymentStatus(orderId) {
    // 重置轮询计数
    this.setData({
      pollCount: 0
    });

    // 清除之前的定时器
    if (this.data.pollTimer) {
      clearTimeout(this.data.pollTimer);
    }

    // 显示loading
    const { lang } = this.data;
    my.showLoading({
      content: lang.message.loading_ellipsis
    });

    // 开始轮询
    this.pollPaymentStatus(orderId);
  },

  // 轮询支付状态
  pollPaymentStatus(orderId) {
    const { pollCount } = this.data;

    // 超过最大次数，当作异常处理
    if (pollCount >= 10) {
      console.error('Polling exceeded max count, treat as error');
      this.handlePollingError('Polling exceeded max count');
      return;
    }

    // 查询支付状态
    this.queryPaymentStatus(orderId).then((result) => {
      const { orderStatus } = result;

      // 根据订单状态处理
      if (orderStatus === 'TOPUP_SUCCESS') {
        // 充值成功，停止轮询，显示成功弹窗
        this.stopPolling();
        this.showSuccessModal('oneTime');
      } else if (orderStatus === 'TOPUP_FAILED' || orderStatus === 'CLOSED' || orderStatus === 'ERROR') {
        // 充值失败，停止轮询，显示异常弹窗
        this.stopPolling();
        this.showErrorModal('oneTime');
      } else if (orderStatus === 'PENDING' || orderStatus === 'PAID') {
        // 待支付或已支付，继续轮询
        this.continuePolling(orderId);
      } else {
        // 未知状态，继续轮询
        console.warn('Unknown order status:', orderStatus);
        this.continuePolling(orderId);
      }
    }).catch((error) => {
      console.error('Query payment status error:', error);
      // 查询失败时，继续轮询
      this.continuePolling(orderId);
    });
  },

  // 继续轮询
  continuePolling(orderId) {
    const { pollCount } = this.data;

    // 更新轮询次数
    const nextPollCount = pollCount + 1;
    this.setData({
      pollCount: nextPollCount
    });

    // 计算下次轮询的延迟时间
    // 前3次（第1、2、3次）：2秒，之后（第4次开始）：3秒
    // nextPollCount 是下一次轮询的次数，所以判断应该是 < 3（即第1、2次）用2秒，>= 3（即第3次及以后）用3秒
    const delay = nextPollCount <= 3 ? 2000 : 3000;

    // 设置定时器
    const timer = setTimeout(() => {
      this.pollPaymentStatus(orderId);
    }, delay);

    this.setData({
      pollTimer: timer
    });
  },

  // 停止轮询
  stopPolling() {
    if (this.data.pollTimer) {
      clearTimeout(this.data.pollTimer);
      this.setData({
        pollTimer: null,
        pollCount: 0
      });
    }
    // 隐藏loading
    my.hideLoading();
  },

  // 处理轮询异常
  handlePollingError() {
    // 停止轮询
    this.stopPolling();

    // 显示异常弹窗
    this.showErrorModal('oneTime', false);
  },

  // 关闭异常弹窗
  handleErrorModalOk() {
    this.setData({
      errorModalVisible: false
    });
  },

  // 重试（根据错误类型执行不同的重试逻辑）
  handleErrorModalRetry() {
    const { errorModalErrorType, payMethod, editRecurring } = this.data;

    // 关闭弹窗
    this.setData({
      errorModalVisible: false
    });

    // 根据错误类型执行不同的重试逻辑
    if (errorModalErrorType === 'oneTime') {
      // 单次充值重试：重新执行单次充值流程（重新获取 paymentId 和 redirectUrl）
      this.createOneTimeTopUp();
    } else if (errorModalErrorType === 'recurring') {
      // 定期充值重试：重新执行定期充值流程
      if (editRecurring) {
        this.editRecurringTopUp();
      } else {
        this.createRecurringTopUp();
      }
    }
  },

  // 查询支付状态接口
  // 接口入参：orderId string 是 订单ID
  // 返回：{ orderStatus: string, orderId: string }
  // orderStatus 订单状态：
  //   PAID("PAID"), // 已支付
  //   PENDING("PENDING"), // 待支付
  //   TOPUP_SUCCESS("TOPUP_SUCCESS"), // 充值成功
  //   TOPUP_FAILED("TOPUP_FAILED"), // 充值失败
  //   CLOSED("CLOSED"), // 已关闭
  //   ERROR("ERROR"), // 错误
  async queryPaymentStatus(orderId) {
    console.log('Query payment status, orderId:', orderId, 'pollCount:', this.data.pollCount);

    try {
      const res = await getOneTimeStatusAPI(orderId);
      console.log('Payment status response:', res);

      const orderStatus = res.data.orderStatus || 'UNKNOWN';

      return {
        orderStatus,
        orderId,
      };
    } catch (error) {
      console.error('Query payment status error:', error);
      // 查询失败时返回 UNKNOWN 状态，继续轮询
      return {
        orderStatus: 'UNKNOWN',
        orderId: orderId,
        error: error.message
      };
    }
  }
}));
