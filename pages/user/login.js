import * as config from '../../config.js';
import {R} from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    username: '',
    password: ''
  },

  onLoad: function(options) {

  },

  usernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },

  passwordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  doLogin: function() {
    wx.showLoading({
      title: '登陆中...'
    });
    var self = this;
    wx.request({
      url: config.serverRouter.getToken,
      method: 'POST',
      data: {
        username: self.data.username,
        password: self.data.password
      },
      success: function (res) {
        if (res.statusCode != 200 && res.statusCode != 201) {
          wx.hideLoading();
          wx.showToast({
            title: '工号或密码错误',
            icon: 'none'
          });
          return;
        }
        app.globalData.token = res.data.token;
        wx.login({
          success: function (login_res) {
            R({
              url: config.serverRouter.wechatAuth,
              method: 'PUT',
              data: {
                code: login_res.code
              }
            }, function() {
              wx.redirectTo({
                url: '../index/index'
              });
            });
          }
        }); 
      }
    });
  }
})