import {
  createPage
} from "@miniu/data";
import {
  getNationListAPI,
  getOperatorListAPI,
  getUserInfoAPI
} from "../../services/index";

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
        currentNation: {},
        currentNationIndex: 0,
        currentOperator: '',
        currentOperatorIndex: 0
      };
    },
    onLoad(query) {
      this.initData();
      this.getNationList();
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

    async getgetOperatorList(number) {
      try {
        my.showLoading();
        const res = await getOperatorListAPI(number);
        my.hideLoading();
        const {
          data
        } = res || {};
        this.setData({
          operatorList: data,
          currentOperator: data ? data[0].operator : ''
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

    selectContact() {
      my.choosePhoneContact({
        success: (res) => {
          this.setData({
            user: {
              ...res,
            },
            firstName: res.name && res.name.substring(0, 1),
          });
          this.getgetOperatorList(res.mobile)
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
          const data = {
            phone: arr[1]
          }
          if (nationIndex >= 0) {
            data.currentNation = this.data.nationList[nationIndex]
            data.currentNationIndex = nationIndex
          }
          this.getgetOperatorList(arr[1])
          this.setData({
            phone: arr[1]
          })
        }
      } catch (error) {
        my.hideLoading()
      }
      // my.getAuthCode({
      //   scopes: ["auth_user"],
      //   success: (res) => {
      //     console.log("authCode", res);
      //     const authCode = res.authCode;
      //     this.clearUser();
      //   },
      //   fail: (err) => {
      //     my.alert({
      //       content: JSON.stringify(err),
      //     });
      //   },
      // });
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
        this.getgetOperatorList(value);
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
      const arr = this.data.operatorList.map(item => item.operator)
      my.optionsSelect({
        selectedOneIndex: this.data.currentOperatorIndex,
        optionsOne: arr,
        positiveString: this.data.lang.home.operatorConfirm,
        negativeString: this.data.lang.home.operatorCancel,
        success: (res) => {
          if (res.selectedOneIndex) {
            this.setData({
              currentOperator: arr[res.selectedOneIndex],
              currentOperatorIndex: res.selectedOneIndex
            });
          }
        },
      });
    },

    checkPhoneNum(isTip = true) {
      // 获取手机号
      const phoneNumber = (this.data.user && this.data.user.mobile) || this.data.phone;

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

    submit() {
      if (!this.checkPhoneNum()) {
        return;
      }
      if (!this.data.currentOperator) {
        my.showToast({
          content: this.data.lang.home.chooseOperator
        });
        return;
      }
      let queryStr = `phoneNumber=${encodeURIComponent(this.data.currentNation.phonePrefix)} ${this.data.phone}&operator=${this.data.currentOperator}`;
      if (this.data.user && this.data.user.mobile) {
        queryStr = `phoneNumber=${this.data.user.mobile}&userName=${this.data.user.name}&operator=${this.data.currentOperator}`;
      }
      let jumpUrl = `/pages/set-recurring/set-recurring?${queryStr}`;
      if (this.data.payMethod === "oneTime") {
        jumpUrl = `/pages/choose-amount/choose-amount?${queryStr}`;
      }
      my.navigateTo({
        url: jumpUrl,
      });
    },
  })
);