// pages/reserve/reserve.js
var appAjax = require('./../../utils/app-ajax');
var appSession = require("./../../utils/app-session.js");
var utils = require("./../../utils/utils.js");
utils.formateDate();
let that = null;
let remoteMethods = {
    getUserGroup: function (id, _callback) {
        appAjax.postJson({
            autoShowWait: true,
            type: 'GET',
            service: "GET_USER_GROUP",
            otherParams: {
                id: id
            },
            success: function (ret) {
                _callback && _callback(ret);
            }
        });
    },
    saveMeeting: function (postData, _callback) {
        appAjax.postJson({
            autoShowWait: true,
            type: 'POST',
            service: "SAVE_MEETING",
            data: postData,
            success: function (ret) {
                _callback && _callback(ret);
            }
        });
    }
}
let localMethods = {
    validation: function (that) {
        if (!that.data.topic) {
            this.toast('请输入会议名称');
            return;
        }
        if (!that.data.sponsor) {
            this.toast('请联系管理员编辑您的gitee name');
            return;
        }
        if (!that.data.groupId) {
            this.toast('请选择所属SIG');
            return;
        }
        if (!that.data.date) {
            this.toast('请选择日期');
            return;
        }
        if (!that.data.start) {
            this.toast('请选择开始时间');
            return;
        }
        if (!that.data.end) {
            this.toast('请选择结束时间');
            return;
        }
        if ((that.data.start.split(':')[0] > that.data.end.split(':')[0]) || (that.data.start.split(':')[0] == that.data.end.split(':')[0] && that.data.start.split(':')[1] >= that.data.end.split(':')[1])) {
            this.toast('开始时间必须小于结束时间');
            return;
        }
        return true;
    },
    toast: function (msg) {
        wx.showToast({
            title: msg,
            icon: "none",
            duration: 2000
        });
    }
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        topic: '',
        sponsor: '',
        groupName: '',
        groupId: '',
        date: '',
        start: '',
        end: '',
        etherpad: '',
        agenda: '',
        emaillist: '',
        sigPopShow: false,
        sigResult: '',
        sigList: [],
        datePopShow: false,
        curDate: new Date().getTime(),
        currentDate: new Date().getTime(),
        minDate: new Date().getTime(),
        timePopShow: false,
        currentTime: '08:00',
        minTime: 8,
        maxTime: 22,
        endTimePopShow: false,
        currentEndTime: '08:00',
        minEndTime: 8,
        maxEndTime: 22,
        showDialogWarn: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    reset: function () {
        this.setData({
            topic: '',
            groupName: '',
            group_name: '',
            group_id: '',
            groupId: '',
            date: '',
            start: '',
            end: '',
            etherpad: '',
            agenda: '',
            emaillist: ''
        })
    },
    meeting: function () {
        if (!localMethods.validation(this)) {
            return;
        }
        let that = this;
        wx.requestSubscribeMessage({
            tmplIds: ['k1SE-Cy2nwCkRRD7BBYKFQInwDXNs1sZuMcqECJgBgg'],
            success(res) {
                remoteMethods.saveMeeting({
                    topic: that.data.topic,
                    sponsor: that.data.sponsor,
                    group_name: that.data.groupName,
                    group_id: that.data.groupId,
                    date: that.data.date,
                    start: that.data.start,
                    end: that.data.end,
                    etherpad: that.data.etherpad,
                    agenda: that.data.agenda,
                    emaillist: that.data.emaillist
                }, function (data) {
                    if (data.id) {
                        wx.redirectTo({
                            url: '/pages/meeting/meeting-success?id=' + data.id,
                        })
                    } else {
                        setTimeout(function () {
                            wx.showToast({
                                title: data.message,
                                icon: "none",
                                duration: 2000
                            }, 100);
                        })
                    }
                })
            }
        })

    },
    sigNameInput: function (e) {
        this.setData({
            topic: e.detail.value
        })
    },
    etherInput: function (e) {
        this.setData({
            etherpad: e.detail.value
        })
    },
    agendaInput: function (e) {
        this.setData({
            agenda: e.detail.value
        })
    },
    emailInput: function (e) {
        this.setData({
            emaillist: e.detail.value
        })
    },
    sigConfirm: function () {
        let that = this;
        let sigObj = this.data.sigList.filter(function (item) {
            return item.group === that.data.sigResult;
        });
        sigObj = sigObj.length ? sigObj[0] : {}
        this.setData({
            groupName: sigObj.group_name || '',
            groupId: sigObj.group || '',
            etherpad: sigObj.etherpad || '',
            sigPopShow: false
        })
    },
    dateConfirm: function () {
        this.setData({
            date: (new Date(this.data.currentDate)).Format("yyyy-MM-dd"),
            datePopShow: false
        })
    },
    timeConfirm: function () {
        this.setData({
            start: this.data.currentTime,
            timePopShow: false
        })
    },
    endTimeConfirm: function () {
        this.setData({
            end: this.data.currentEndTime,
            endTimePopShow: false
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        that = this;
        this.setData({
            sponsor: appSession.getUserInfoByKey('gitee') || ''
        })
        let that = this;
        remoteMethods.getUserGroup(appSession.getUserInfoByKey('userId'), function (data) {
            if (data && data.length) {
                that.setData({
                    sigList: data
                })
            }
        })
    },
    sigRadioOnChange: function (e) {
        this.setData({
            sigResult: e.detail
        })
    },
    selSig: function () {
        if (!this.data.sigList.length) {
            this.setData({
                showDialogWarn: true
            })
            return;
        }
        this.setData({
            sigPopShow: true
        })
    },
    warnCancel: function () {
        this.setData({
            showDialogWarn: false
        })
    },
    sigCancel: function () {
        this.setData({
            sigPopShow: false
        })
    },
    selDate: function () {
        this.setData({
            datePopShow: true
        })
    },
    selTime: function () {
        this.setData({
            timePopShow: true
        })
    },
    selEndTime: function () {
        this.setData({
            endTimePopShow: true
        })
    },
    dateCancel: function () {
        this.setData({
            datePopShow: false
        })
    },
    timeCancel: function () {
        this.setData({
            timePopShow: false
        })
    },
    endTimeCancel: function () {
        this.setData({
            endTimePopShow: false
        })
    },
    dateOnInput: function (e) {
        this.setData({
            currentDate: e.detail
        })
    },
    timeOnInput: function (e) {
        this.setData({
            currentTime: e.detail
        })
    },
    endTimeOnInput: function (e) {
        this.setData({
            currentEndTime: e.detail
        })
    },
})