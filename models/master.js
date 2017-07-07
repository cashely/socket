//药师数据模型
const mongoose = require('../db.js');

const defaultName = ['黄药师','李药师','周药师','文药师'];



const Schema = new mongoose.Schema({
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        default:defaultName[~~(Math.random()*defaultName.length)]
    },
    image:{
        type:String
    },
    socketId:String,
    friends:[],
    star:{
        type:Number,
        default:0
    },
    messages:[],
    regDate:{
        type:Date,
        default:new Date()
    },
    login:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('master',Schema);
