import {
  createComponent
} from '@miniu/data'

Component(createComponent({
  mapGlobalDataToData: {
    lang: (g) => g.lang
  },
  props: {
    isMore: true,
    onLoadMore: null
  },
  data: {
    type: 'loadMore' // loadMore loading noMore
  },
  didMount() {
    this.observeLoadMore()
  },
  methods: {
    observeLoadMore() {
      const observe = my.createIntersectionObserver();
      observe.relativeToViewport({
        bottom: -20
      }).observe('#loadMore', res => {
        if (this.props.isMore) {
          this.setData({
            type: 'loading'
          })
          this.loadMoreHandle()
        }
      })
    },
    async loadMoreHandle() {
      if (Object.prototype.toString.call(this.props.onLoadMore) === '[object Function]') {
        await this.props.onLoadMore()
        this.setData({
          type: this.props.isMore ? 'loadMore' : 'noMore'
        })
      }
    }
  },
}));