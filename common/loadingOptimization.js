let hasLoading = false;

export const showLoading = (options) => {
  if (hasLoading) {
    my.hideLoading({
      success() {
        processShowLoading(options);
      },
    });
  } else {
    processShowLoading(options);
  }
}

function processShowLoading(options) {
  hasLoading = true;
  if (!options) {
    my.showLoading({
      content: getApp().globalData.lang.message.loading_ellipsis,
    });
  } else {
    my.showLoading(options);
  }
}

export const hideLoading = (options) => {
  if (hasLoading) {
    hasLoading = false;
    my.hideLoading(options);
  }
}