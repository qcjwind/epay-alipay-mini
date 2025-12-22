Component({
  props: {
    visible: false,
    title: 'Select',
    options: [],
    selectedIndex: 0,
    onClose() {},
    onConfirm() {},
    onSelect() {}
  },

  data: {
    currentIndex: 0
  },

  observers: {
    'visible, selectedIndex'(visible, selectedIndex) {
      if (visible && selectedIndex !== undefined) {
        this.setData({
          currentIndex: selectedIndex
        });
      }
    }
  },

  methods: {
    handleClose() {
      this.props.onClose();
    },

    handleSelect(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      this.setData({
        currentIndex: index
      });
      if (this.props.onSelect) {
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

