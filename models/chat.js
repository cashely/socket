const mongoose = require('../db.js');
const Schema = new mongoose.Schema({
    from:String,
    to:String,
    message:String,
    date:{
        type:Date,
        default:Date.now()
    },
    msgType:{
        type:Number,//0-不显示 1-正常
        default:1
    }
});
const chat = mongoose.model('chat',Schema);

module.exports = chat;
