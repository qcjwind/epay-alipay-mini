Component({
  props: {
    visible: false,
    title: 'Select',
    options: [],
    selectedIndex: 0,
    onClose() {},
    onConfirm() {},
    onSelect: null
  },

  data: {
    currentIndex: 0,
    currentId: ''
  },

  // observers: {
  //   'visible, selectedIndex'(visible, selectedIndex) {
  //     console.log('selectedIndex', selectedIndex);
  //     if (visible && selectedIndex !== undefined) {
  //       this.setData({
  //         currentIndex: selectedIndex
  //       });
  //     }
  //   }
  // },

  deriveDataFromProps(nextProps) {
    if (this.userSelected) {
      this.userSelected = false
      return
    }
    const newData = {
      visible: nextProps.visible
    }
    if (nextProps.selectedIndex !== this.props.selectedIndex) {
      newData.currentIndex = nextProps.selectedIndex;
    }
    if (nextProps.visible) {
      newData.currentId = `item-${nextProps.selectedIndex}`
    }
    this.setData({
      ...newData
    })
  },

  methods: {
    handleClose() {
      this.props.onClose();
      this.setData({
        currentIndex: this.props.selectedIndex
      })
    },

    handleSelect(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      this.userSelected = true;
      this.setData({
        currentIndex: index
      });
      if (Object.prototype.toString.call(this.props.onSelect) === '[object Function]') {
        this.props.onSelect(index);
      }
    },

    handleConfirm() {
      if (this.props.onConfirm) {
        this.props.onConfirm(this.data.currentIndex);
      }
    }
  }
});