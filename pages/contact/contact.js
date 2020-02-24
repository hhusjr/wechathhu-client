import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    hidden: true,
    userMeta: {},
    queryParams: {
      'my': 'yes'
    },
    keyword: '',
    showMeta: false,
    current: {},
    searchFocus: false
  },

  onSearchFocus: function (e) {
    this.setData({
      searchFocus: true
    })
  },

  onSearchBlur: function (e) {
    this.setData({
      searchFocus: false
    })
  },

  doShowMeta: function (e) {
    var id = e.currentTarget.dataset.id
    var self = this
    this.setData({
      current: self.data.userMeta[id],
      id: id,
      showMeta: true
    })
  },

  hideModal: function (e) {
    this.setData({
      showMeta: false
    })
  },

  friendOnly: function (e) {
    var checked = e.detail.value
    this.data.queryParams['my'] = checked ? 'yes' : 'no'
    this.getQueryset(true, checked ? '仅显示同事' : '显示所有人员')
  },

  inputKeyword: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  doSearch: function (e) {
    this.data.queryParams['search'] = this.data.keyword
    this.getQueryset(true)
  },

  getQueryset: function (showLoad = false, tipMessage = null) {
    if (showLoad) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    var self = this
    R({
      url: config.serverRouter.contacts,
      method: 'GET',
      data: self.data.queryParams
    }, function (res) {
      if (showLoad) {
        wx.hideLoading()
      }
      if (tipMessage) {
        wx.showToast({
          title: tipMessage,
          icon: 'none'
        })
      }
      var users = res.data
      var list = []
      var contacts = {}
      var userMeta = {}
      for (var user of users) {
        if (!contacts[user.alpha]) {
          list.push(user.alpha)
          contacts[user.alpha] = []
        }
        contacts[user.alpha].push(user.user_meta.id)
        userMeta[user.user_meta.id] = user
      }

      self.setData({
        list: list,
        listCur: list[0],
        contacts: contacts,
        userMeta: userMeta
      })
    })
  },

  onLoad() {
    this.getQueryset(true)
  },
  onReady() {
    let that = this;
    wx.createSelectorQuery().select('.indexBar-box').boundingClientRect(function (res) {
      that.setData({
        boxTop: res.top
      })
    }).exec();
    wx.createSelectorQuery().select('.indexes').boundingClientRect(function (res) {
      that.setData({
        barTop: res.top
      })
    }).exec()
  },
  //获取文字信息
  getCur(e) {
    this.setData({
      hidden: false,
      listCur: this.data.list[e.target.id],
    })
  },

  setCur(e) {
    this.setData({
      hidden: true,
      listCur: this.data.listCur,
      listCurID: this.data.listCur
    })
  },
  
  indexSelect(e) {
    let that = this;
    let barHeight = this.data.barHeight;
    let list = this.data.list;
    let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
    for (let i = 0; i < list.length; i++) {
      if (scrollY < i + 1) {
        that.setData({
          listCur: list[i],
          movableY: i * 20
        })
        return false
      }
    }
  },

  doFriend: function (e) {
    var alpha = e.currentTarget.dataset.alpha
    var index = e.currentTarget.dataset.index
    var user  = this.data.contacts[alpha][index]
    var action = e.currentTarget.dataset.action
    var self = this
    var map = {
      'add': ['POST', true, '同事添加成功'],
      'remove': ['DELETE', false, '同事删除成功']
    }
    R({
      url: config.serverRouter.friends + user + '/',
      method: map[action][0]
    }, function () {
      self.setData({
        ['userMeta.' + user + '.is_friend']: map[action][1]
      })
      wx.showToast({
        title: map[action][2],
      })
    })
  },

  doContact: function (e) {
    var id = e.currentTarget.dataset.id
    var self = this
    var userMeta = self.data.userMeta[id]
    var params = {
      firstName: userMeta.fullname,
      mobilePhoneNumber: userMeta.phone,
      lastName: userMeta.user_meta.last_name,
      organization: config.organization,
      title: userMeta.post,
      email: userMeta.user_meta.email
    }
    
    var paramsFinal = {}
    for (var param in params) {
      if (!params[param]) continue
      paramsFinal[param] = params[param]
    }

    wx.addPhoneContact(paramsFinal)
  },

  doPhone: function (e) {
    var id = e.currentTarget.dataset.id
    var self = this
    var userMeta = self.data.userMeta[id]
    wx.makePhoneCall({
      phoneNumber: userMeta.phone.toString()
    })
  }
});