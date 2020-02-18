import * as config from '../../config.js';
import {
  R
} from '../../utils/util.js'
import moment from '../../utils/moment.js'

const app = getApp()

Page({
  data: {
    name: '获取中...',
    formMetas: {},
    values: {},
    activityId: null
  },

  handleTextField: function (e) {
    var name = e.currentTarget.dataset.name;
    this.data.values[name] = e.detail.value;
    this.setData({
      values: this.data.values
    });
  },

  handleRadioField: function (e) {
    var name = e.currentTarget.dataset.name;
    this.data.values[name] = e.detail.value;
    this.setData({
      values: this.data.values
    });
  },

  handleCheckboxField: function (e) {
    var name = e.currentTarget.dataset.name;
    this.data.values[name] = {};
    for (var val of e.detail.value) {
      this.data.values[name][val] = true;
    }
    this.setData({
      values: this.data.values
    });
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '活动报名'
    });
    wx.showLoading({
      title: '正在加载报名表单...'
    });
    var self = this;
    R({
      url: config.serverRouter.activities + options.id + '/',
      method: 'GET'
    }, function (res) {
      if (res.data.my_enrollment_count > 0) {
        wx.hideLoading();
        wx.showToast({
          title: '已报名过',
          duration: 2000,
          mask: true,
          success: function () {
            setTimeout(function () {
              wx.navigateBack({});
            }, 2000);
          }
        });
        return;
      }
      res = res.data;
      var formMetas = JSON.parse(res.form_metas);
      var values = {};
      var field;
      for (var name in formMetas) {
        field = formMetas[name];
        if (field.type == 'text' || field.type == 'textarea' || field.type == 'number') {
          values[name] = field.default ? field.default : '';
          continue;
        }
        if (field.type == 'radio') {
          values[name] = field.default ? field.choices.indexOf(field.default) : 0;
          continue;
        }
        if (field.type == 'checkbox') {
          values[name] = {};
          if (!field.default) continue;
          for (var def of field.default) {
            var choicePos = field.choices.indexOf(def)
            if (choicePos == -1) continue
            values[name][choicePos] = true;
          }
          continue;
        }
      }
      self.setData({
        activity: res.name,
        formMetas: formMetas,
        values: values,
        activityId: res.id,
        id: res.id,
        isParticipant: res.my_enrollment_count > 0,
      });
      wx.hideLoading();
    });
  },

  doEnroll: function () {
    var self = this;
    wx.showModal({
      title: '提示',
      content: '报名信息不可更改哦，确定要报名吗？',
      success: function (res) {
        if (!res.confirm) return;
        var values = self.data.values;
        var valuesResult = {};
        var formMetas = self.data.formMetas;
        var field;
        for (var name in formMetas) {
          field = formMetas[name];
          if (field.type == 'radio') {
            valuesResult[name] = field.choices[values[name]];
            continue;
          }
          if (field.type == 'checkbox') {
            valuesResult[name] = [];
            for (var item in values[name]) {
              if (values[name][item]) valuesResult[name].push(field.choices[item]);
            }
            continue;
          }
          valuesResult[name] = values[name];
        }
        var participatingMetas = JSON.stringify(valuesResult);

        wx.showLoading({
          title: '正在报名...'
        });

        R({
          url: config.serverRouter['enrollments'],
          method: 'POST',
          data: {
            activity: self.data.activityId,
            participating_metas: participatingMetas
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '报名成功！',
            success: function () {
              wx.navigateBack({});
            }
          });
        }, function (res) {
          wx.hideLoading();
          var errorInfo
          if (res.data.non_field_errors) {
            errorInfo = res.data.non_field_errors[0]
          } else if (res.data.activity) {
            errorInfo = res.data.activity[0]
          } else {
            errorInfo = '报名失败'
          }
          wx.showToast({
            title: errorInfo,
            icon: 'none'
          });
        });
      }
    });
  }
})