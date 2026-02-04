import {
  createPage
} from "@miniu/data";
import {
  getNationListAPI,
  getOperatorAPI,
  getOperatorListAPI,
  getUserInfoAPI
} from "../../services/index";
import {
  checkRecurringAPI
} from "../../services/topup";

Page(
  createPage({
    mapGlobalDataToData: {
      lang: (g) => g.lang,
      code: (g) => g.code,
    },
    data() {
      return {
        visible: false,
        firstName: "",
        user: null,
        showAddBtn: false,
        selectedOneIndex: 0,
        selectedOneOption: "",
        operator: [],
        phone: '',
        cursorNum: 0,
        payMethod: "oneTime",
        operatorList: [],
        operatorOptions: [], // 运营商选项数组（用于 popup-picker）
        currentNation: {},
        currentNationIndex: 0,
        currentOperator: '',
        currentOperatorIndex: 0,
        operatorPickerVisible: false,
        debounceTimer: null // 防抖定时器
      };
    },
    onLoad(query) {
      this.initData();
      this.getNationList();
      this.getgetOperatorList()
    },

    async getNationList() {
      try {
        my.showLoading();
        const res = await getNationListAPI();
        my.hideLoading();
        const {
          data
        } = res || {};
        this.setData({
          nationList: data,
          currentNation: data ? data[0] : null,
        });
      } catch (error) {
        my.hideLoading();
      }
    },

    async getOperatorHandle(e) {
      const mobile = e.detail.value || '';
      try {
        my.showLoading()
        // 确保 phonePrefix 是字符串
        const phonePrefix = (this.data.currentNation && this.data.currentNation.phonePrefix) ? String(this.data.currentNation.phonePrefix) : '';
        // 确保 phoneNumber 是字符串
        let phoneNumber = mobile ? String(mobile) : (this.data.phone ? String(this.data.phone) : '');
        
        // 检查 phoneNumber 是否已经包含前缀（以 + 开头）
        const hasPrefix = phoneNumber && phoneNumber.trim().startsWith('+');
        
        // 组合完整手机号：如果已有前缀则直接使用，否则添加前缀并用空格隔开
        let phoneNumberWithPrefix;
        if (hasPrefix) {
          // 如果已有前缀，确保前缀和号码之间有空格
          if (phoneNumber.includes(' ')) {
            phoneNumberWithPrefix = phoneNumber;
          } else {
            // 如果前缀和号码没有空格，添加空格
            const match = phoneNumber.match(/^(\+\d+)(.*)$/);
            if (match) {
              phoneNumberWithPrefix = `${match[1]} ${match[2]}`;
            } else {
              phoneNumberWithPrefix = phoneNumber;
            }
          }
        } else {
          // 如果没有前缀，添加前缀并用空格隔开
          phoneNumberWithPrefix = phonePrefix && phoneNumber
            ? `${phonePrefix} ${phoneNumber}`
            : phoneNumber;
        }
        
        const res = await getOperatorAPI(phoneNumberWithPrefix);
        my.hideLoading()
        const index = this.data.operatorOptions.findIndex(item => item === res.data.operator)
        if (index < 0) {
          this.setData({
            currentOperator: '',
            currentOperatorIndex: 0
          })
          return
        }
        this.setData({
          currentOperator: this.data.operatorOptions[index],
          currentOperatorIndex: index
        })
      } catch (error) {
        my.hideLoading()
      }
    },

    async getgetOperatorList(number) {
      try {
        my.showLoading();
        // 清理手机号：保留前缀和号码之间的空格，去掉号码中间的空格
        const cleanNumber = this.cleanPhoneNumber(number || '');
        // 获取当前国家的前缀
        const phonePrefix = this.data.currentNation.phonePrefix || '';
        // 如果号码已经包含前缀，直接使用；否则添加前缀
        let phoneNumberWithPrefix = cleanNumber;
        if (phonePrefix && !cleanNumber.startsWith('+')) {
          phoneNumberWithPrefix = `${phonePrefix} ${cleanNumber}`;
        }
        const res = await getOperatorListAPI(phoneNumberWithPrefix);
        my.hideLoading();
        const {
          data
        } = res || {};
        const operatorOptions = data ? data.map(item => item.operator) : [];
        this.setData({
          operatorList: data,
          operatorOptions: operatorOptions,
          // currentOperator: data ? data[0].operator : '',
          // currentOperatorIndex: 0
        });
      } catch (error) {
        my.hideLoading();
      }
    },

    chooseNation() {
      const arr = this.data.nationList.map((item) => item.nation);
      my.optionsSelect({
        selectedOneIndex: this.data.currentNationIndex,
        optionsOne: arr,
        positiveString: this.data.lang.home.operatorConfirm,
        negativeString: this.data.lang.home.operatorCancel,
        success: (res) => {
          this.setData({
            currentNation: this.data.nationList[res.selectedOneIndex],
            currentNationIndex: res.selectedOneIndex
          });
        },
      });
    },

    initData() {
      const arr = [{
          key: "oneTime",
          icon: "/assets/icons/repeate-one.png",
          label: this.data.lang.home.oneTime,
        },
        {
          key: "recurring",
          icon: "/assets/icons/calendar-01.png",
          label: this.data.lang.home.recurring,
        },
      ];
      this.setData({
        operator: arr,
      });
    },

    switchOperator(e) {
      const {
        currentTarget: {
          dataset: {
            key
          },
        },
      } = e || {};
      this.setData({
        payMethod: key,
      });
    },

    // 清理手机号：保留前缀和号码之间的空格，去掉号码中间的空格
    // 例如："+39 123 456 789" -> "+39 123456789"
    cleanPhoneNumber(phoneNumber) {
      if (!phoneNumber) return '';

      // 如果包含 + 前缀，保留前缀和第一个空格，去掉后面的空格
      if (phoneNumber.trim().startsWith('+')) {
        const trimmed = phoneNumber.trim();
        const firstSpaceIndex = trimmed.indexOf(' ');
        if (firstSpaceIndex > 0) {
          // 有空格分隔前缀和号码
          const prefix = trimmed.substring(0, firstSpaceIndex + 1); // 包含空格
          const numberPart = trimmed.substring(firstSpaceIndex + 1).replace(/\s+/g, '');
          return prefix + numberPart;
        } else {
          // 没有空格，直接去掉所有空格
          return trimmed.replace(/\s+/g, '');
        }
      } else {
        // 没有 + 前缀，直接去掉所有空格
        return phoneNumber.replace(/\s+/g, '');
      }
    },

    selectContact() {
      my.choosePhoneContact({
        success: (res) => {
          // 处理手机号：保留前缀和号码之间的空格，去掉号码中间的空格
          let mobile = this.cleanPhoneNumber(res.mobile || '');
          
          // 判断是否带了前缀（以 + 开头）
          const hasPrefix = mobile && mobile.trim().startsWith('+');
          const phonePrefix = this.data.currentNation.phonePrefix || '';
          
          // 如果没有带前缀，主动添加当前选择的国家前缀
          if (!hasPrefix && phonePrefix && mobile) {
            mobile = `${phonePrefix} ${mobile}`;
          }
          
          // 从 mobile 中提取号码部分（去掉前缀）
          let phoneNumber = mobile;
          if (mobile && mobile.includes('+')) {
            const parts = mobile.split(' ');
            phoneNumber = parts.length > 1 ? parts[1] : parts[0].replace(/\+/g, '').replace(/\s+/g, '');
          } else if (mobile) {
            phoneNumber = mobile.replace(/\s+/g, '');
          }
          
          this.setData({
            user: {
              ...res,
              mobile: mobile, // mobile 存储完整号码（包含前缀）
            },
            firstName: res.name && res.name.substring(0, 1),
            phone: phoneNumber,
          }, () => {
            // setData 完成后触发获取运营商
            this.getgetOperatorList(mobile);
            if (phoneNumber && this.data.currentNation && this.data.currentNation.phonePrefix) {
              this.getOperatorHandle();
            }
          });
          // this.getgetOperatorList(mobile)
          this.getOperatorHandle(mobile)
        },
      });
    },

    async getMyNumber() {
      try {
        my.showLoading()
        const res = await getUserInfoAPI();
        my.hideLoading()
        const {
          data
        } = res || {}
        const {
          phoneNumber
        } = data || {}
        if (phoneNumber) {
          const arr = phoneNumber.split('-')
          const nationIndex = this.data.nationList.findIndex(item => item.phonePrefix === `+${arr[0]}`)
          const updateData = {
            phone: arr[1],
            user: null,
            firstName: ""
          }
          if (nationIndex >= 0) {
            updateData.currentNation = this.data.nationList[nationIndex]
            updateData.currentNationIndex = nationIndex
          }
          // this.getgetOperatorList(arr[1])
          this.setData(updateData, () => {
            this.getOperatorHandle()
          })
        }
      } catch (error) {
        my.hideLoading()
      }
    },

    enterNumber() {
      this.clearUser();
    },

    inpNumber(e) {
      const {
        detail: {
          value
        },
      } = e || {};
      // value 可能为 'e'（number 类型输入在部分端上的异常情况），需要特殊处理
      const strValue = String(value || '');
      const filteredValue = strValue.replace(/[^0-9]/g, '');
      this.setData({
        phone: filteredValue,
        cursorNum: 3
      })
      if (this.checkPhoneNum(false)) {
        this.setData({
          showAddBtn: true,
        })
        // this.getgetOperatorList(value);
        // if (my.env.platform === 'iOS') {
        //   this.getOperatorHandle()
        // }
      }
    },

    clearUser() {
      this.setData({
        user: null,
        phone: "",
        firstName: "",
      });
    },

    chooseOperator() {
      const arr = this.data.operatorList.map(item => item.operator);
      if (arr.length === 0) {
        my.showToast({
          content: 'No operator available'
        });
        return;
      }
      this.setData({
        operatorPickerVisible: true
      });
    },

    handleOperatorPickerClose() {
      this.setData({
        operatorPickerVisible: false
      });
    },

    handleOperatorPickerConfirm(index) {
      const {
        operatorOptions
      } = this.data;
      const selectedOperator = operatorOptions[index];
      this.setData({
        currentOperator: selectedOperator,
        currentOperatorIndex: index,
        operatorPickerVisible: false
      });
    },

    checkPhoneNum(isTip = true) {
      // 获取手机号
      let phoneNumber = (this.data.user && this.data.user.mobile) || this.data.phone;

      // 检查手机号是否存在
      if (!phoneNumber) {
        if (isTip) {
          my.alert({
            title: this.data.lang.home.alert.title,
            content: this.data.lang.home.alert.msg,
            buttonText: this.data.lang.home.alert.btn,
          });
        }
        return false;
      }

      if (phoneNumber.includes('+')) {
        phoneNumber = phoneNumber.split(' ')[1]
      }

      // 确保手机号只包含数字
      if (!/^\d+$/.test(phoneNumber)) {
        if (isTip) {
          my.alert({
            title: this.data.lang.home.alert.invalidTitle,
            content: this.data.lang.home.alert.msg,
            buttonText: this.data.lang.home.alert.btn,
          });
        }
        return false;
      }

      // 检查手机号长度：只支持 9 位或 10 位数字
      const phoneLength = phoneNumber.length;
      if (phoneLength !== 9 && phoneLength !== 10) {
        if (isTip) {
          my.alert({
            title: this.data.lang.home.alert.invalidTitle,
            content: this.data.lang.home.alert.msg,
            buttonText: this.data.lang.home.alert.btn,
          });
        }
        return false;
      }

      return true;
    },

    saveContact() {
      if (!this.checkPhoneNum()) {
        return;
      }
      // 组合电话号码（phonePrefix + phoneNumber，用空格隔开）
      const phonePrefix = this.data.currentNation.phonePrefix || '';
      const phoneNumber = this.data.phone || '';
      const mobilePhoneNumber = phonePrefix && phoneNumber
        ? `${phonePrefix} ${phoneNumber}`
        : phoneNumber;

      my.addPhoneContact({
        mobilePhoneNumber: mobilePhoneNumber,
      });
    },

    clsoeContact() {
      this.setData({
        visible: false,
      });
    },

    async submit() {
      if (!this.checkPhoneNum()) {
        return;
      }
      if (!this.data.currentOperator) {
        my.showToast({
          content: this.data.lang.home.chooseOperator
        });
        return;
      }

      const phonePrefix = this.data.currentNation.phonePrefix || '';

      // 获取 phoneNumber（优先使用联系人的 mobile）
      let phoneNumber = this.data.user && this.data.user.mobile ?
        this.data.user.mobile :
        (this.data.phone || '');

      // 清理手机号：保留前缀和号码之间的空格，去掉号码中间的空格
      phoneNumber = this.cleanPhoneNumber(phoneNumber);

      // 如果 phoneNumber 包含前缀（以 + 开头），去掉前缀
      if (phoneNumber && phoneNumber.includes('+')) {
        // 如果包含空格分隔（如 "+39 123456789"），去掉前缀部分
        if (phoneNumber.includes(' ')) {
          const parts = phoneNumber.split(' ');
          // 如果第一个部分是前缀（以 + 开头），去掉它
          if (parts[0].startsWith('+')) {
            phoneNumber = parts.slice(1).join('');
          }
        } else {
          // 如果前缀和号码没有空格分隔，尝试根据 phonePrefix 截取
          if (phonePrefix) {
            const prefixWithoutPlus = phonePrefix.replace(/^\+/, '').trim();
            if (phoneNumber.startsWith(prefixWithoutPlus)) {
              phoneNumber = phoneNumber.substring(prefixWithoutPlus.length);
            }
          }
        }
      }

      // 如果是周期充值，提前校验手机号的激活状态
      if (this.data.payMethod === 'recurring') {
        try {
          my.showLoading();

          // 组合电话号码（phonePrefix + phoneNumber，用空格隔开）
          const phoneNumberWithPrefix = phonePrefix && phoneNumber ?
            `${phonePrefix} ${phoneNumber}` :
            phoneNumber || '';

          const isRecurring = await checkRecurringAPI({
            phoneNumber: phoneNumberWithPrefix,
          });

          // 根据状态码判断是否已激活
          if (isRecurring.data) {
            my.hideLoading();
            my.alert({
              title: this.data.lang.confirmTopUp.recurringAlreadyActivatedError.title,
              content: this.data.lang.confirmTopUp.recurringAlreadyActivatedError.content,
              buttonText: this.data.lang.confirmTopUp.recurringAlreadyActivatedError.btn,
            });
            return;
          }

          my.hideLoading();
        } catch (error) {
          my.hideLoading();
          // 如果校验失败，继续跳转（可能是网络错误等）
          console.error('Check recurring status error:', error);
        }
      }

      // 使用 encodeURIComponent 编码参数，确保 + 号不会丢失
      let queryStr = `phoneNumber=${encodeURIComponent(phoneNumber)}&phonePrefix=${encodeURIComponent(phonePrefix)}&operator=${encodeURIComponent(this.data.currentOperator)}&payMethod=${encodeURIComponent(this.data.payMethod)}`;
      if (this.data.user && this.data.user.mobile) {
        // 选择联系人时，传递 userName
        queryStr = `phoneNumber=${encodeURIComponent(phoneNumber)}&phonePrefix=${encodeURIComponent(phonePrefix)}&userName=${encodeURIComponent(this.data.user.name)}&operator=${encodeURIComponent(this.data.currentOperator)}&payMethod=${encodeURIComponent(this.data.payMethod)}`;
      }
      let jumpUrl = `/pages/set-recurring/set-recurring?${queryStr}`;
      if (this.data.payMethod === "oneTime") {
        jumpUrl = `/pages/choose-amount/choose-amount?${queryStr}`;
      }
      my.navigateTo({
        url: jumpUrl,
      });
    },
    async onPullDownRefresh() {
      await this.getNationList();
      my.stopPullDownRefresh()
    }
  })
);