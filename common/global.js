import { } from './../config/config.js'
// API 基础路径
global.API_DOMAIN = ""
global.API_VERSION = "v1.0";
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
  wx.hideLoading();
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
global.doLogin = (data) =>{};

//调用登录接口
global.login = () =>{
  var now = new Date().getTime();
  if (now - lastLoginTime < 1000){
    console.log('重复登录请求')
    return ;
  }
  lastLoginTime = now;
  wx.login({
    loadingText: '授权登录',
    success: (response) => {
      var code = response.code;
      wx.getUserInfo({
        success: (res) => {
          var data = {
            "encrypted_data": res.encryptedData,
            "iv": res.iv,
            "code": code
          };
          global.doLogin(data)
        }
      })
    }
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

module.exports = {}