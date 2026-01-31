import {
  getHistoryListAPI,
  getHistoryDetailAPI
} from '../../../../services/index'
import { numberToWeekDay } from '../../../../utils/util'
import { createComponent } from "@miniu/data";

Component(
  createComponent({
    mapGlobalDataToData: {
      lang: (g) => g.lang,
    },
    props: {},
    data: {
      isMore: true,
      visible: false,
      historyList: [],
      historyDetail: null
    },
  didMount() {
    this.paging = {
      pageSize: 20,
      pageNum: 1,
    };
    this.getHistoryList()
  },
  methods: {
    onLoadMore() {
      return new Promise(async (resolve) => {
        this.paging.pageNum++
        try {
          await this.getHistoryList()
          resolve(true)
        } catch (error) {
          this.paging.pageNum--
        }
      })
    },
    closeDetailPopup() {
      this.setData({
        visible: false,
        historyDetail: null
      })
    },
    openHistortDetail(e) {
      const {
        currentTarget: {
          dataset: {
            id
          }
        }
      } = e || {};
      this.getHistoryDetail(id)
    },
    getHistoryDetail(id) {
      my.showLoading()
      getHistoryDetailAPI(id).then(res => {
        my.hideLoading()
        const data = res.data || {};
        
        // 生成频率显示文本
        let frequencyText = '';
        if (data.isRecurring && data.recurringType && data.recurringDay) {
          const frequencyLabel = data.recurringType === 'WEEK' ? 'Weekly' : 'Monthly';
          let dayText = '';
          
          if (data.recurringType === 'WEEK') {
            // 周：将数字转换为星期名称
            const weekDay = numberToWeekDay(String(data.recurringDay));
            dayText = `on ${weekDay}`;
          } else {
            // 月：显示日期，添加序数后缀
            const day = parseInt(data.recurringDay);
            const suffix = this.getDaySuffix(day);
            dayText = `on ${day}${suffix} day`;
          }
          
          frequencyText = `${frequencyLabel} - ${dayText}`;
        }
        
        // 生成头像首字母：参考支付确认页逻辑，优先使用 phoneUserName
        let avatarInitials = '';
        const userName = data.phoneUserName || data.nickName || '';
        if (userName) {
          const parts = userName.trim().split(/\s+/);
          if (parts.length >= 2) {
            // 如果有多个单词，取第一个和最后一个的首字母
            avatarInitials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
          } else if (parts.length === 1) {
            // 如果只有一个单词，取前两个字符
            avatarInitials = parts[0].substring(0, 2).toUpperCase();
          }
        }
        
        this.setData({
          visible: true,
          historyDetail: {
            ...data,
            frequencyText: frequencyText,
            avatarInitials,
            hasUserName: !!userName
          }
        })
      }).catch(() => {
        my.hideLoading()
      })
    },
    
    // 获取日期的序数后缀（1st, 2nd, 3rd, 4th...）
    getDaySuffix(day) {
      if (day >= 11 && day <= 13) {
        return 'th';
      }
      const lastDigit = day % 10;
      switch (lastDigit) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    },
    async getHistoryList() {
      const param = {
        ...this.paging
      }
      my.showLoading()
      try {
        const res = await getHistoryListAPI(param)
        my.hideLoading()
        const {
          list,
          total
        } = res.data || {};
        const arr = list.map(item => {
          // 生成头像首字母：参考支付确认页逻辑
          let avatarInitials = '';
          const userName = item.phoneUserName || item.nickName || '';
          if (userName) {
            const parts = userName.trim().split(/\s+/);
            if (parts.length >= 2) {
              // 如果有多个单词，取第一个和最后一个的首字母
              avatarInitials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
            } else if (parts.length === 1) {
              // 如果只有一个单词，取前两个字符
              avatarInitials = parts[0].substring(0, 2).toUpperCase();
            }
          }
          
          return {
            ...item,
            avatarInitials,
            hasUserName: !!userName
          }
        })
        
        // 判断是否为第一页（加载更多时追加，首次加载时替换）
        const isFirstPage = this.paging.pageNum === 1;
        const newList = isFirstPage ? arr : [...this.data.historyList, ...arr];
        
        this.setData({
          historyList: newList,
          isMore: this.paging.pageNum * this.paging.pageSize < total
        })
      } catch (error) {
        my.hideLoading()
      }
    },
    },
  })
);