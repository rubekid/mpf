/**
 * ajax 请求
 * Created by Administrator on 2017-08-11.
 */
import AuthEncrypt from '../auth/auth-encrypt'
import DateUtil from '../utils/date-util'
import TokenManager from '../auth/token-manager'
import AjaxCache from '../cache/ajax-cache'

var METHOD_GET = 'GET'
var METHOD_POST = 'POST'
var METHOD_PUT = 'PUT'
var METHOD_DELETE = 'DELETE'

/**
 * 错误提示
 * @type {Function}
 */
function showError(message){
  (global.showError || alert)(message)
}

/**
 * 参数重组
 * @param args
 */
function rebuild(args){
  var config = {};
  if(args.length === 1){
    if (typeof args[0] === 'string') {
      config.url = args[0]
    }
    else{
      config = args[0]
    }
  } else if (args.length === 2) {
    config = args[1] ? args[1] : {}
    config.url = args[0]
  }
  else if(args.length === 3) {
    config = args[2] ? args[2] : {}
    config.url = args[0]
    if(args[1] !== null){
      config.data = args[1]
    }
  }
  return config
}

var Http = {
  get: function () {
    var config = rebuild(arguments)
    config.method = METHOD_GET
    Http.execute(config)
  },
  post: function () {
    var config = rebuild(arguments)
    config.method = METHOD_POST
    Http.execute(config)
  },
  put: function () {
    var config = rebuild(arguments)
    config.method = METHOD_PUT
    Http.execute(config)
  },
  delete: function () {
    var config = rebuild(arguments)
    config.method = METHOD_DELETE
    Http.execute(config)
  },
  execute: function (config) {
    config.method = (config.method || config.type || METHOD_GET).toUpperCase()

    // 设置头部
    config.header = config.header || config.headers || {}
    // 普通表单方式提交
    if(config.form && config.method === METHOD_POST){
      config.header['Content-Type'] = config.header['Content-Type'] || 'application/x-www-form-urlencoded'
    }
    else{
      config.header['Content-Type'] = config.header['Content-Type'] || 'application/json'
    }
    /**
     * 设置平台信息
     */
    config.header['Platform'] = 'mini_program';

    Http.combine(config)

    // 设置授权头部
    var token = TokenManager.get();
    config.header['Authorization'] = AuthEncrypt.getMac(config.method, config.baseURL + decodeURIComponent(config.url), token)

    // 成功回调
    var successCallback = config.success || function (response, status, header, config) {}

    // 失败回调
    var errorCallback = config.fail || config.error || function (response, status, header) {
      if (config.ignore) {
        return
      }
      if (status && status === 403) {
        global.login && global.login()
        return
      } else if (status && status === 503) {
        global.sysLocked && global.sysLocked(response)
        return
      }else if (response && response.message) {
        global.showError(response.message)
      }
    }


    // 使用缓存数据
    if (config.method === METHOD_GET) {
      var lastResponse = AjaxCache.get(config.url)
      if (config.useLast && lastResponse) {
        successCallback(lastResponse)
      }
    }

    config.success = function (response) {
      if (response.statusCode == 200) {
        successCallback(response.data);
        //设置缓存数据
        if (config.useLast) {
          AjaxCache.set(config.url, response);
        }
      }
      else {
        if (response.statusCode == 403) {
          global.login();
        }
        else {
          if (response && response.data && response.data.message){
            global.showError(response.data.message);
          }
          else{
            global.showError('请求失败');
          }
        }

      }
    }

    config.fail =  function (response) {
      global.showError('请求失败，请检查网络')
    }
    if (config.url.indexOf('http') !== 0) {
      config.url = config.baseURL + config.url;
    }
    wx.request(config);
  },
  /**
   * 获取授权信息
   * @param config
   */
  getAuthorization: function (config) {
    config.method = (config.method || config.type || METHOD_GET).toUpperCase()
    Http.combine(config)
    var token = TokenManager.get()
    return AuthEncrypt.getMac(config.method, config.baseURL + config.url, token)
  },
  /**
   * 数据合并
   * @param config
   */
  combine: function (config) {
    // 替换路径占位符号
    if (config.path) {
      for (var key in config.path) {
          config.url = config.url.replace('{' + key + '}', config.path[key])
      }
      delete config.path
    }
    config.data = config.data || config.body || config.form;


    var isFormData = config.isFormData
    if (!isFormData) {
      // 过滤掉null数据
      var data = config.data;
      var method = config.method
      if(config.query){
        data = config.query
        method = METHOD_GET
      }
      config.data = Http.filter(config.data)
      data = Http.filter(data)
      config.url = AuthEncrypt.httpUrlFormat(config.url, data, method)
    }
    // 非http开头的加上API_BASE_PATH
    if (config.url.indexOf('http') !== 0) {
      if (!global.API_BASE_PATH) {
        throw new Error('请配置接口基本地址global.API_BASE_PATH')
      }
      config.baseURL = global.API_BASE_PATH
    }
    delete config.body
    delete config.query
    delete config.form
  },
  filter: function (data) {
    var _data = {}
    for (var i in data) {
      var val = data[i]
      if (val === null || typeof val === 'undefined') {
        continue
      }
      if (/\d{4}-\d{1,2}-\d{1,2} {1}\d{1,2}:\d{1,2}:\d{1,2}$/.test(val)) {
        val = DateUtil.toDate(val)
      }
      _data[i] = val
    }
    return _data
  }
}
export default Http
