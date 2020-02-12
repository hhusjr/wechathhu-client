import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    ids: [],
    names: [],
    categoryIndex: null,
    location: '',
    description: ''
  },

  bindCategoryChange: function (e) {
    this.setData({
      categoryIndex: e.detail.value
    })
  },

  onLoad: function (options) {
    var self = this
    wx.setNavigationBarTitle({
      title: '故障报修'
    });
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    R({
      url: config.serverRouter.repairs + 'categories/',
      method: 'GET'
    }, function (res) {
      for (var item of res.data) {
        self.data.ids.push(item.id)
        self.data.names.push(item.name)
      }
      self.setData({
        ids: self.data.ids,
        names: self.data.names
      })
      wx.hideLoading()
    })
  },

  inputLocation: function (e) {
    this.setData({
      location: e.detail.value
    })
  },

  inputDescription: function (e) {
    this.setData({
      description: e.detail.value
    })
  },

  doRequest: function () {
    var self = this
    var description = this.data.description
    var location = this.data.location
    var category = this.data.ids[this.data.categoryIndex]
    if (!description || !location || !category) {
      wx.showToast({
        title: '请完成填写后再提交',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '保存中...',
      mask: true
    })
    R({
      url: config.serverRouter.repairs,
      method: 'POST',
      data: {
        description: description,
        location: location,
        category: category
      }
    }, function (res) {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '报修成功！',
        success: function () {
          wx.redirectTo({
            url: 'my',
          })
        }
      });
    })
  }
})