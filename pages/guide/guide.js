import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: false,
    guides: {},
    queryParams: {}
  },
  getQueryset(initial = false) {
    var self = this
    self.setData({
      load: false
    })
    if (initial) 
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

    R({
      url: config.serverRouter.guides,
      method: 'GET',
      data: this.data.queryParams
    }, function (res) {
      if (initial) wx.hideLoading()
      var guides = {}
      var list = []
      var id = 0
      for (var guide of res.data) {
        if (!guides[guide.category.id]) {
          guides[guide.category.id] = []
          list.push({
            cid: guide.category.id,
            name: guide.category.name,
            id: id++
          })
        }
        guides[guide.category.id].push({
          id: guide.id,
          name: guide.name,
          created: moment(guide.created).format('YYYY-MM-DD HH:mm')
        })
      }
      self.setData({
        list: list,
        listCur: list[0],
        load: true,
        guides: guides
      })
    })
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '服务指南'
    });
    this.getQueryset(true)
  },


  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputShowed: false
    });
    this.clearInput();
  },
  clearInput: function () {
    delete this.data.queryParams['search'];
    this.setData({
      inputVal: '',
      queryParams: this.data.queryParams
    });
    this.queryList();
  },
  inputTyping: function (e) {
    this.data.queryParams['search'] = e.detail.value;
    this.setData({
      inputVal: e.detail.value,
      queryParams: this.data.queryParams
    });
    this.getQueryset()
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },

  doDownload: function (e) {
    var id = e.currentTarget.dataset.id
    wx.showLoading({
      title: '下载中...',
      mask: true
    })
    wx.downloadFile({
      url: config.serverRouter.guides + id + '/',
      header: {
        'Authorization': 'Token ' + app.globalData.token
      },
      success: function (res) {
        wx.hideLoading()
        if (parseInt(res.statusCode / 100) == 2) {
          wx.showToast({
            title: '下载成功',
          })
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: function (res) {
              wx.openDocument({
                filePath: res.savedFilePath,
                fail: function () {
                  wx.showToast({
                    title: '打开失败',
                    icon: 'none'
                  })
                }
              })
            }
          })
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      }
    })
  },

  doEmail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.showLoading({
      title: '发送中...',
      mask: true
    })
    R({
      url: config.serverRouter.guides + id + '/email/',
      method: 'POST'
    }, function (res) {
      wx.showToast({
        title: '发送成功',
      })
    }, function (res) {
      wx.showToast({
        title: res.data.detail,
        icon: 'none'
      })
    }, function () {
      wx.hideLoading()
    })
  }
})