// API 基础路径
global.API_BASE_PATH = "https://server.toybox.nobuyme.com"

// 登录URI
global.LOGIN_URI = "/wxapp/login"

// 应用名称
global.APP_NAME = "Toybox"

// 应用标题
global.APP_TITLE = "ToyBox共享玩具"

// 加密秘钥
global.APP_SECRET_KEY = ""

// 分页大小
global.PAGE_SIZE =  20

//主题颜色
const PRIMARY_COLOR = '#F3D535';

//错误提示
global.showError = function (message, success){
  success = success || function(){}
  wx.showModal({
    content: message,
    showCancel: false, 
    confirmText: '确定',
    confirmColor: PRIMARY_COLOR,
    success:success
  })
};

/**
 * 确认框
 */
global.showConfirm = function(config){
  config.confirmColor = config.confirmColor || PRIMARY_COLOR;
  config.cancelColor = config.cancelColor || PRIMARY_COLOR;
  wx.showModal(config)
}

//Toast
global.toast = function (message) {
  wx.showToast({
    icon:'success',
    title: message
  })
};

//loading
global.showLoading = function(message){
  wx.showLoading({
    title: message || ''
  });
};

//hideLoading
global.hideLoading = function(){
  wx.hideLoading();
}


/**
 * 推送消息
 * @param message multi
 * @param msgType String
 */
global.push = function(body, msgType){
    msgType = msgType || 'text'
    var data = {
        'msgtype': msgType,
        [msgType] : body
    }
    wx.request({
      url: global.API_BASE_PATH + '/webhook',
      method:'POST',
      data:data
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
    catch(e){console.log(e)}
};

module.exports = {}
