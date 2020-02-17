import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    firstName: '',
    lastName: ''
  },
  onLoad: function () {
    this.setData({
      firstName: app.globalData.userInfo.firstName,
      lastName: app.globalData.userInfo.lastName
    });
  },
  doClockin: function () {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrcode'],
      success: function (res) {
        var key = res.result
        wx.showLoading({
          title: '打卡中...',
          mask: true
        })
        R({
          url: config.serverRouter.activities + 'clockins/',
          method: 'POST',
          data: {
            key: key
          }
        }, function (res) {
          wx.showModal({
            title: '打卡成功',
            showCancel: false,
            content: '【操作】' + res.data.label + '\n【活动】' + res.data.activity_name
          });
        }, function (res) {
          wx.showModal({
            title: '打卡失败',
            showCancel: false,
            content: res.data.detail
          });
        }, function (res) {
          wx.hideLoading()
        })
      }
    })
  },
  userSettings: function () {
    wx.showActionSheet({
      itemList: ['编辑账户信息', '注销登陆'],
      success: function (res) {
        var handlers = {
          0: function () {
            wx.navigateTo({
              url: '../user/change'
            });
          },
          1: function () {
            wx.showModal({
              title: '提示',
              content: '确定注销登陆吗？此操作会解除您的账号与微信的绑定哦～',
              success: function (res) {
                if (!res.confirm) return;
                wx.showLoading({
                  title: '注销中...',
                });
                R({
                  url: config.serverRouter.wechatAuth,
                  method: 'DELETE',
                }, function (res) {
                  wx.redirectTo({
                    url: '../index/index'
                  })
                });
              }
            });
          }
        };
        handlers[res.tapIndex]();
      }
    });
  }
})