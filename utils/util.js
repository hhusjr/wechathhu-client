import * as config from '../config.js';

const app = getApp();

export function R(params, onSuccess, onValidationFailure = null, onComplete = function () {}) {
  if (params.header == undefined) params.header = {};
  params.header = Object.assign({}, {
    'Authorization': 'Token ' + app.globalData.token
  }, params.header);

  var interceptors = {
    200: onSuccess, // OK
    201: onSuccess, // Created
    204: onSuccess, // Deleted
    403: function () {
      wx.redirectTo({
        url: '../user/login'
      });
    }, // Forbidden
    401: function () {
      wx.redirectTo({
        url: '../user/login'
      });
    }, // Unauthorized, maybe token is expired
  };
  if (onValidationFailure != null) {
    interceptors[400] = onValidationFailure;
  }

  params.success = function (res) {
    if (!(res.statusCode in interceptors)) {
      wx.showToast({
        title: '未知错误',
        icon: 'none'
      });
      return;
    }
    interceptors[res.statusCode](res);
  };

  params.complete = onComplete

  wx.request(params);
}

export function emptyToNull(data) {
  var res = {};
  for (var x in data) {
    res[x] = data[x] ? data[x] : null;
  }
  return res;
}