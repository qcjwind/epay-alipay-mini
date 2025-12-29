import {
  createPage
} from "@miniu/data";
import {
  getNationListAPI,
  getOperatorListAPI
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

    getMyNumber() {
      my.getAuthCode({
        scopes: ["auth_base"],
        success: (res) => {
          console.log("authCode", res);
          const authCode = res.authCode;
          this.clearUser();
        },
        fail: (err) => {
          my.alert({
            content: JSON.stringify(err),
          });
        },
      });
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
          if(res.selectedOneIndex){
            this.setData({
              currentOperator: arr[res.selectedOneIndex],
              currentOperatorIndex: res.selectedOneIndex
            });
          }
        },
      });
    },

    checkPhoneNum(isTip = true) {
      if (this.data.user) {
        if (!this.data.user.mobile) {
          isTip &&
            my.alert({
              title: this.data.lang.home.alert.title,
              content: this.data.lang.home.alert.msg,
              buttonText: this.data.lang.home.alert.btn,
            });
          return false;
        }
      } else {
        if (!this.data.phone) {
          isTip &&
            my.alert({
              title: this.data.lang.home.alert.title,
              content: this.data.lang.home.alert.msg,
              buttonText: this.data.lang.home.alert.btn,
            });
          return false;
        }
        if (this.data.phone.length !== 10) {
          isTip &&
            my.alert({
              title: this.data.lang.home.alert.invalidTitle,
              content: this.data.lang.home.alert.msg,
              buttonText: this.data.lang.home.alert.btn,
            });
          return false;
        }
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