Component({
  props: {
    open: false,
    onClose() { },
  },
  methods: {
    close() {
      this.props.onClose();
    },
  },
});
