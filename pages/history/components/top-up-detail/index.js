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
    historyDetail: {}
  },
  data: {},
  didMount() {
  },
  methods: {
    closePopup() {
      if (Object.prototype.toString.call(this.props.onClose) === '[object Function]') {
        this.props.onClose()
      }
    },
    deleteHandle() {
      my.confirm({
        title: this.data.lang.history.delete.title,
        content: this.data.lang.history.delete.text,
        cancelButtonText: this.data.lang.history.delete.cancel,
        confirmButtonTextL: this.data.lang.history.delete.confirm,
        success: (res) => {
          if (res.confirm) {}
        }
      })
    }
  }
}));