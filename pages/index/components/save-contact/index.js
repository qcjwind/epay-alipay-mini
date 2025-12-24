import {
  createComponent
} from '@miniu/data'
Component(createComponent({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  props: {
    visible: false,
    onClose: null,
    phone: ''
  },
  data: {
    firstName: '',
    lastName: ''
  },
  didMount() {},
  methods: {
    firstNameChange(e) {
      const {
        detail: {
          value
        }
      } = e || {}
      this.setData({
        firstName: value
      })
    },
    lastNameChange(e) {
      const {
        detail: {
          value
        }
      } = e || {}
      this.setData({
        lastName: value
      })
    },
    saveHandle() {
      if (!this.data.firstName) {
        my.showToast({
          content: this.data.lang.home.firstNameRequire
        })
        return
      }
      my.addPhoneContact({
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        mobilePhoneNumber: this.props.phone,
        success: () => {
          this.closePopup()
        }
      })
    },
    closePopup() {
      if (Object.prototype.toString.call(this.props.onClose) === '[object Function]') {
        this.props.onClose()
      }
    }
  },
}));