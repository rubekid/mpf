/**
 * 加密工具
 */

import Md5 from '../utils/md5.js'
import DateUtil from '../utils/date-util'

var AuthEncrypt = {}

/**
 * 是否为数组
 */
function isArray (v) {
  return toString.apply(v) === '[object Array]'
}

/**
 * uri
 * @param val
 * @param pctEncodeSpaces
 * @returns {string}
 */
AuthEncrypt.encodeUriQuery = function (val, pctEncodeSpaces) {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'))
    .replace(/'/g, '%27')
}

AuthEncrypt.httpUrlFormat = function (urlOld, paramData, method) {
  if (paramData) {
    var urlArray = []

    paramData = isArray(paramData) ? (paramData.length > 0 ? paramData[0] : []) : paramData
    for (var key in paramData) {
      var value = paramData[key]
      if (isArray(value)) {
        if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
          var arrayValueCell = []
          for (var keyCell in value) {
            var valueCell = value[keyCell]
            arrayValueCell.push(key + '=' + AuthEncrypt.encodeUriQuery(valueCell))
          }
          if (arrayValueCell.length > 0) {
            urlArray.push(arrayValueCell.join('&'))
          }
        }
      } else {
        if (urlOld.indexOf(':' + key, value) !== -1) {
          urlOld = urlOld.replace(':' + key, AuthEncrypt.encodeUriQuery(value))
        } else {
          if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
            urlArray.push(key + '=' + AuthEncrypt.encodeUriQuery(value))
          }
        }
      }
    }

    urlArray.sort(function (a, b) {
      return a.localeCompare(b)
    })
    urlOld = encodeURI(urlOld) + (urlArray.length > 0 ? ('?' + urlArray.join('&')) : '')
  } else {
    urlOld = encodeURI(urlOld)
  }
  return (urlOld)
}

AuthEncrypt.encode = function (token, hmackey, method, uri, host, paramData, serverTime, localTime) {
  var rtnArray = []
  var sbRawMac = []
  var timestamp = serverTime && localTime ? new Date().getTime() + (serverTime - localTime) : new Date().getTime()
  var randomStr = Md5(Math.random()).substring(8, 16)
  var nonce = [timestamp, ':', randomStr].join('')
  sbRawMac.push(nonce)
  sbRawMac.push('\n')
  sbRawMac.push(method.toUpperCase())
  sbRawMac.push('\n')
  sbRawMac.push(AuthEncrypt.httpUrlFormat(uri, paramData, method))
  sbRawMac.push('\n')
  sbRawMac.push(host)
  sbRawMac.push('\n')

  rtnArray.push('MAC id="')
  rtnArray.push(token)
  rtnArray.push('",nonce="')
  rtnArray.push(nonce)
  rtnArray.push('",mac="')
  rtnArray.push(Md5(sbRawMac.join(''), hmackey))
  rtnArray.push('"')
  return rtnArray.join('')
}

/**
 * 获取MAC
 */
AuthEncrypt.getMac = function (method, url, token, paramData) {
  if (token == null) {
    return ''
  }
  url = decodeURIComponent(url)
  url = url.replace(/^(http|https):\/\//, '')
  var pos = url.indexOf('/')
  var host = url.substr(0, pos)
  var uri = url.substring(pos)
  return AuthEncrypt.encode(token.access_token, token.mac_key, method, uri, host, paramData, DateUtil.toDate(token.server_time), DateUtil.toDate(token.local_time))
}

export default AuthEncrypt
