import * as config from '../../config.js';
import {
  R,
  emptyToNull
} from '../../utils/util.js'

const app = getApp()

Page({
  data: {
    tabs: ['基本信息', '通讯录信息'],
    activeIndex: 0,
    firstName: '',
    lastName: '',
    password: '',
    userName: '',
    email: '',
    department: null,
    errors: {},
    userMeta: {},
    departments: []
  },

  bindDepartmentChange: function (e) {
    var val = e.detail.value
    this.setData({
      department: this.data.departments[val]
    })
  },

  tabClick: function (e) {
    this.setData({
      activeIndex: e.currentTarget.id
    });

    var self = this
    if (e.currentTarget.id == 1) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      R({
        url: config.serverRouter.currentUser + 'meta/',
        method: 'GET'
      }, function (res) {
        self.setData({
          userMeta: res.data
        })
        wx.hideLoading()
      });
    }
  },

  inputMeta: function (e) {
    var name = e.currentTarget.dataset.name
    var value = e.detail.value
    this.setData({
      ['userMeta.' + name]: value
    })
  },

  submitMeta: function (e) {
    wx.showLoading({
      title: '修改中...',
      mask: true
    })
    var self = this
    R({
      url: config.serverRouter.currentUser + 'meta/',
      method: 'PUT',
      data: self.data.userMeta
    }, function (res) {
      for (var field in self.data.errors) self.data.errors[field] = false;
      self.setData({
        errors: self.data.errors
      });
      wx.hideLoading()
      wx.showToast({
        title: '修改成功',
      })
    }, function (res) {
      var first_message = null;
      for (var field in self.data.errors) self.data.errors[field] = false;
      for (var field in res.data) {
        self.data.errors[field] = true;
        if (first_message == null) first_message = res.data[field][0];
      }
      self.setData({
        errors: self.data.errors
      });
      wx.showToast({
        title: first_message,
        icon: 'none'
      });
    })
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '编辑账户信息'
    });
    var userInfo = app.globalData.userInfo
    this.setData({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      userName: userInfo.userName,
      email: userInfo.email
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var self = this
    R({
      url: config.serverRouter.departments,
      method: 'GET'
    }, function(res) {
      var departments = res.data
      self.setData({
        departments: departments,
        department: {
          id: userInfo.department.id,
          name: userInfo.department.name
        }
      })
      wx.hideLoading()
    })
  },
  inputFirstName: function (e) {
    this.setData({
      firstName: e.detail.value
    });
  },
  inputLastName: function (e) {
    this.setData({
      lastName: e.detail.value
    });
  },
  inputEmail: function (e) {
    this.setData({
      email: e.detail.value
    })
  },
  inputPassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  doChange: function () {
    var firstName = this.data.firstName;
    var lastName = this.data.lastName;
    var password = this.data.password;
    var email = this.data.email;
    console.log(this.data.department)
    var department = this.data.department ? this.data.department.id : null;
    var data = {
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'department': department
    };
    if (password != '') data['password'] = password;
    var self = this;
    wx.showLoading({
      title: '修改中...',
      mask: true
    })
    R({
      url: config.serverRouter.currentUser,
      method: 'PUT',
      data: data
    }, function (res) {
      var first_message = null;
      for (var field in self.data.errors) self.data.errors[field] = false;
      self.setData({
        errors: self.data.errors
      });
      wx.hideLoading()
      wx.showToast({
        title: '修改成功'
      })
      var userInfo = res.data;
      app.globalData.userInfo = {
        firstName: userInfo['first_name'],
        lastName: userInfo['last_name'],
        email: userInfo['email'],
        userName: userInfo['username'],
        department: userInfo['department']
      }
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      prevPage.setData({
        firstName: app.globalData.userInfo.firstName,
        lastName: app.globalData.userInfo.lastName
      })
    }, function (res) {
      var first_message = null;
      for (var field in self.data.errors) self.data.errors[field] = false;
      for (var field in res.data) {
        self.data.errors[field] = true;
        if (first_message == null) first_message = res.data[field][0];
      }
      self.setData({
        errors: self.data.errors
      });
      wx.showToast({
        title: first_message,
        icon: 'none'
      });
    });
  }
})