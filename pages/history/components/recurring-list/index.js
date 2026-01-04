import { createComponent } from "@miniu/data";
import {
  getRecurringListAPI,
  deleteRecurringAPI,
} from "../../../../services/index";

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
        pageNumber: 1,
        total: 0,
      };
      this.getRecurringList();
    },
    methods: {
      onLoadMore() {
        return new Promise(async (resolve) => {
          this.paging.pageNumber++;
          try {
            await this.getRecurringList();
            resolve(true);
          } catch (error) {
            this.paging.pageNumber--;
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
          this.setData({
            isMore: +total / this.paging.pageSize > this.paging.pageSize,
            recurringList: list,
            total,
          });
        } catch (error) {
          my.hideLoading();
        }
      },
      switchHandle() {
        this.setData({
          switchBtn: !this.data.switchBtn,
        });
      },
      refreshRecurringList() {
        this.paging.pageNumber = 1;
        this.getRecurringList();
      },
      delRecurring(e) {
        const {
          currentTarget: {
            dataset: { id },
          },
        } = e || {};
        if (!id) return;
        my.confirm({
          title: this.data.lang.history.delete.title,
          content: this.data.lang.history.delete.text,
          cancelButtonText: this.data.lang.history.delete.cancel,
          confirmButtonTextL: this.data.lang.history.delete.confirm,
          success: async (res) => {
            if (res.confirm) {
              my.showLoading();
              try {
                await deleteRecurringAPI(id);
                my.hideLoading();
                this.refreshRecurringList();
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
