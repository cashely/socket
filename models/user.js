//用户document
const mongoose = require('../db.js');

let Schema = new mongoose.Schema({
    userName:{
        type:String
    },//用户真实姓名
    nickName:{
        type:String
    },//昵称
    sex:{
        type:Number,
        default:0//0-男,1-女
    },//性别
    socketId:{
        type:String
    },//通信Id
    hospitalId:{
        type:String
    },//住院号码
    phone:{
        type:String
    },//联系电话
    name:{
        type:String
    },//真实姓名
    crads:{
        type:[{
            id:String,
            hospitalName:String
        }],
        default:[]
    },//诊疗卡
    regDate:{
        type:Date,
        default:new Date()
    },//注册日期
    login:{
        type:Boolean,
        default:false
    },//登录状态
    lastDate:{
        type:Date
    },//最后登录时间
    wxId:{
        type:String
    },//微信Id
    wxName:{
        type:String
    },//微信名
    wxImage:{
        type:String
    },//微信头像
    wxCode:String,//微信code
    message:{
        type:[],
        default:[]
    },//离线消息列表
    password:String,
    type:{
        type:Number,
        default:0//0-用户   1-药师
    },
    master:String,//用户来自谁推荐的
    star:{
        type:Number,
        default:0
    },
    friends:[],//聊天过的朋友
    parent:String//来自谁的邀请
});


let user = mongoose.model('user',Schema);
module.exports = user;
