import {
  createPage
} from "@miniu/data";
import {
  getNationListAPI,
  getOperatorAPI,
  getOperatorListAPI,
  getUserInfoAPI
} from "../../services/index";
import { checkRecurringAPI } from "../../services/topup";

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
        payMethod: "oneTime",
        operatorList: [],
        operatorOptions: [], // 运营商选项数组（用于 popup-picker）
        currentNation: {},
        currentNationIndex: 0,
        currentOperator: '',
        currentOperatorIndex: 0,
        operatorPickerVisible: false
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

    async getOperatorHandle() {
      try {
        my.showLoading()
        const res = await getOperatorAPI(`${this.data.currentNation.phonePrefix}${this.data.phone}`);
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
          const mobile = this.cleanPhoneNumber(res.mobile || '');
          this.setData({
            user: {
              ...res,
              mobile: mobile,
            },
            firstName: res.name && res.name.substring(0, 1),
          });
          this.getgetOperatorList(mobile)
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
          this.getgetOperatorList(arr[1])
          this.setData(updateData)
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
      this.setData({
        phone: value,
      })
      if (this.checkPhoneNum(false)) {
        this.setData({
          showAddBtn: true,
        })
        // this.getgetOperatorList(value);
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

      // 检查手机号长度：支持 9 位或 10 位
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
      my.addPhoneContact({
        mobilePhoneNumber: this.data.phone,
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
          const phoneNumberWithPrefix = phonePrefix && phoneNumber
            ? `${phonePrefix} ${phoneNumber}`
            : phoneNumber || '';
          
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