import { } from './../config/config.js'

global.API_BASE_PATH = global.API_DOMAIN + "/" + global.API_VERSION


//主题颜色
const PRIMARY_COLOR = global.PRIMARY_COLOR || '#5D6568';

// 取消
const CANCEL_COLOR = global.CANCEL_COLOR || '#717171';

//错误提示
global.showError = function (message, onConfirm) {
  onConfirm = onConfirm || function () { }
  wx.showModal({
    title: '提示',
    content: message,
    showCancel: false,
    confirmText: '确定',
    confirmColor: PRIMARY_COLOR,
    success: onConfirm
  })
};

//提示框
global.alert = function (message) {
  wx.showModal({
    title: '提示',
    content: message,
    showCancel: false,
    confirmText: '确定',
    confirmColor: PRIMARY_COLOR
  })
};

/**
 * 确认框
 */
global.showConfirm = function (config) {
  config.confirmColor = config.confirmColor || PRIMARY_COLOR;
  config.cancelColor = config.cancelColor || CANCEL_COLOR;
  config.title = config.title || '提示'
  wx.showModal(config)
}

//Toast
global.toast = function (message) {
  setTimeout(() => {
    wx.showToast({
      icon: 'none',
      title: message
    })
  }, 0)
};

// Success
global.success = function (message) {
  setTimeout(() => {
    wx.showToast({
      icon: 'success',
      title: message
    })
  }, 0)
};

// Error
global.error = function (message) {
  setTimeout(() => {
    wx.showToast({
      icon: 'none',
      title: message
    })
  }, 0)
};

var loadingStatus = false;
//loading
global.showLoading = function (message) {
  loadingStatus = true;

  // 使用自定义loading
  var currentPage = global.getCurrentPage();
  if (currentPage) {
    var components = currentPage.data.components || {};
    if (components.loading) {
      currentPage.setData({
        showLoading: true
      })
      return;
    }
  }

  wx.showLoading({
    title: message || ''
  });
};

//hideLoading
global.hideLoading = function () {
  // 未唤起loading 不调用hide 避免和toast冲突
  if (!loadingStatus) {
    return;
  }
  loadingStatus = false;
  // 使用自定义loading
  var currentPage = global.getCurrentPage();
  if (currentPage) {
    var components = currentPage.data.components || {};
    if (components.loading) {
      setTimeout(() => {
        currentPage.setData({
          showLoading: false
        })
      }, 20)

      return;
    }
  }

  wx.hideLoading();
}

/**
 *网络状态变更
 */
global.onNetworkStatusChange = function (res) {
  var status = res.isConnected;
  var currentPage = global.getCurrentPage();
  if (currentPage) {
    var components = currentPage.data.components || {};
    if (components.network) {
      currentPage.setData({
        networkStatus: status
      })
      return;
    }

    if (currentPage.onNetworkStatusChange) {
      currentPage.onNetworkStatusChange(res)
    }
  }
};

/**
 * 获取当前页面对象
 */
global.getCurrentPage = function () {
  var pages = getCurrentPages();
  var len = pages.length;
  var currentPage = null;
  if (len > 0) {
    currentPage = pages[len - 1];
  }
  return currentPage;
}

/**
 * 获取返回页面对象
 */
global.getBackPage = function (delta) {
  delta = delta || 0
  var pages = getCurrentPages();
  var len = pages.length;
  var backPage = null;
  if (len > delta + 1) {
    backPage = pages[len - 2 - delta];
  }
  return backPage;
}

// 全局回调队列
global.callbackQueue = {}
global.navigateTo = function(config){
  var callback = "onCallback" + new Date().getTime()
  global.callbackQueue[callback] = function(res){
    config.success && config.success(res);
    global.callbackQueue[callback] = null
    delete global.callbackQueue[callback]
  }
  wx.navigateTo({
    url: config.url + (config.url.indexOf('?') > 0 ? '&' : '?') + 'callback=' + callback
  })
}

/**
 * 获取当前页面组件
 */
global.getPageComponents = function () {
  var currentPage = global.getCurrentPage();
  var components = {};
  if (currentPage) {
    components = currentPage.data.components || {};
  }
  return components;
}

/**
 * 推送消息
 * @param message multi
 * @param msgType String
 */
global.push = function (body, msgType) {
  msgType = msgType || 'text'
  var data = {
    'msgtype': msgType,
    [msgType]: body
  }
  wx.request({
    url: global.API_BASE_PATH + '/webhook',
    method: 'POST',
    data: data
  })
}


/**
 * 监听错误异常
 * @param err
 * @param url
 * @param line
 */
global.onerror = function (err) {
  try {
    var message =
      '# **' + global.APP_TITLE + '**'
      + "\n\n"
      + '**Platform**：小程序'
      + "\n\n"
      + '**Error**：' + err

    var body = {
      title: '异常通知',
      text: message
    }
    global.push(body, 'markdown');
  }
  catch (e) { console.log(e) }
};

var lastLoginTime = 0;
// 调用接口登录 需要在app.js中重写
global.doLogin = (data) => { };

//调用登录接口
global.login = () => {

  var now = new Date().getTime();
  if (now - lastLoginTime < 1000) {
    console.log('重复登录请求')
    return;
  }
  lastLoginTime = now;


  wx.navigateTo({
    url: '/pages/common/login'
  })
}



/**
 * 钉钉推送
 */
global.dtalk = function (obj) {
  try {
    var body = {
      title: '异常通知',
      text: JSON.stringify(obj)
    }
    global.push(body, 'markdown');
  }
  catch (e) { console.log(e) }
};


/**
 * 获取权限并执行
 */
global.runWithAuth = (config) => {
  var authScope = config.scope;
  wx.getSetting({
    success: (res) => {
      var hasAuth = res.authSetting[authScope];
      // 未申请授权
      if (typeof hasAuth == 'undefined') {
        wx.authorize({
          scope: authScope,
          success() {
            config.success && config.success();
          },
          fail(err) {
            console.log(err);
          }
        })
      }
      // 拒绝授权
      else if (!hasAuth) {
        wx.openSetting({
          success: (res) => {
            if (res.authSetting[authScope]) {
              config.success && config.success();
            }
            else {
              config.fail && config.fail();
            }
          },
          fail: (err) => {
            console.log(err);
          }
        })
      }
      else {
        config.success && config.success();
      }
    },
    fail: (err) => {
      console.log(err);
    }
  });
};

module.exports = {}