import { createComponent } from "@miniu/data";
import {
  getRecurringListAPI,
  changeRecurringStatusAPI,
} from "../../../../services/index";
import { numberToWeekDay } from "../../../../utils/util";

Component(
  createComponent({
    mapGlobalDataToData: {
      lang: (g) => g.lang,
    },
    data: {
      isMore: false,
      switchBtn: false,
      rightAction: [
        {
          type: "delete",
          text: "删除",
        },
      ],
      recurringList: [],
    },
    didMount() {
      this.paging = {
        pageSize: 20,
        pageNum: 1,
      };
      this.getRecurringList();
    },
    methods: {
      onLoadMore() {
        return new Promise(async (resolve) => {
          this.paging.pageNum++;
          try {
            await this.getRecurringList();
            resolve(true);
          } catch (error) {
            this.paging.pageNum--;
          }
        });
      },
      async getRecurringList() {
        try {
          const param = {
            ...this.paging,
          };
          my.showLoading();
          const res = await getRecurringListAPI(param);
          my.hideLoading();
          const { list, total } = res.data || {};
          
          // 处理列表数据，生成频率显示文本
          const processedList = (list || []).map(item => {
            // 生成频率显示文本
            let frequencyText = '';
            if (item.recurringType && item.recurringDay) {
              if (item.recurringType === 'WEEK') {
                // 周：将数字转换为星期名称，格式如 "Weekly - on MONDAY"
                const weekDay = numberToWeekDay(String(item.recurringDay));
                frequencyText = `Weekly - on ${weekDay}`;
              } else {
                // 月：显示日期，添加序数后缀，格式如 "Monthly - on 5th day"
                const day = parseInt(item.recurringDay);
                const suffix = this.getDaySuffix(day);
                frequencyText = `Monthly - on ${day}${suffix} day`;
              }
            }
            
            // 格式化金额显示：参考详情面板格式 "5 €"
            const amountDisplay = item.amount 
              ? `${(item.amount / 100)}`
              : '';
            
            // 生成头像首字母：参考支付确认页逻辑
            let avatarInitials = '';
            if (item.phoneUserName) {
              const parts = item.phoneUserName.trim().split(/\s+/);
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
              frequencyText,
              amountDisplay,
              avatarInitials
            };
          });
          
          // 判断是否为第一页（加载更多时追加，首次加载时替换）
          const isFirstPage = this.paging.pageNum === 1;
          const newList = isFirstPage ? processedList : [...this.data.recurringList, ...processedList];
          
          this.setData({
            isMore: this.paging.pageNum * this.paging.pageSize < total,
            recurringList: newList,
            total,
          });
        } catch (error) {
          my.hideLoading();
        }
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
      async switchHandle(e) {
        // 从事件中获取 agreementId
        const agreementId = e.currentTarget.dataset.id || e.target.dataset.id;
        
        if (!agreementId) {
          console.error('switchHandle: 未找到 agreementId', e);
          return;
        }
        
        // 找到当前项
        const currentItem = this.data.recurringList.find(item => item.agreementId === agreementId);
        if (!currentItem) return;
        
        // 根据当前状态决定操作：ACTIVE -> 暂停，其他 -> 恢复
        const isActive = currentItem.status === 'ACTIVE';
        const newStatus = isActive ? 'PAUSED' : 'ACTIVE';
        
        // 先更新 UI（乐观更新）
        const updatedList = this.data.recurringList.map(item => {
          if (item.agreementId === agreementId) {
            return {
              ...item,
              status: newStatus
            };
          }
          return item;
        });
        
        this.setData({
          recurringList: updatedList
        });
        
        try {
          my.showLoading();
          // 使用统一的 changeRecurringStatusAPI
          await changeRecurringStatusAPI(agreementId, newStatus);
          my.hideLoading();
        } catch (error) {
          my.hideLoading();
          // 如果失败，恢复原状态
          const revertedList = this.data.recurringList.map(item => {
            if (item.agreementId === agreementId) {
              return {
                ...item,
                status: currentItem.status
              };
            }
            return item;
          });
          this.setData({
            recurringList: revertedList
          });
          console.error('切换周期充值状态失败:', error);
        }
      },
      refreshRecurringList() {
        this.paging.pageNum = 1;
        this.getRecurringList();
      },
      delRecurring(e) {
        const {
          currentTarget: {
            dataset: { id },
          },
        } = e || {};
        if (!id) return;
        // 使用 agreementId 删除
        const agreementId = id;
        my.confirm({
          title: this.data.lang.history.delete.title,
          content: this.data.lang.history.delete.text,
          cancelButtonText: this.data.lang.history.delete.cancel,
          confirmButtonTextL: this.data.lang.history.delete.confirm,
          success: async (res) => {
            if (res.confirm) {
              try {
                my.showLoading();
                // 使用统一的 changeRecurringStatusAPI，状态为 DELETED
                await changeRecurringStatusAPI(agreementId, 'DELETED');
                my.hideLoading();
                
                // 从列表中移除该项，不刷新整个列表
                const updatedList = this.data.recurringList.filter(item => item.agreementId !== agreementId);
                this.setData({
                  recurringList: updatedList
                });
              } catch (error) {
                my.hideLoading();
              }
            }
          },
        });
      },
    },
  })
);
