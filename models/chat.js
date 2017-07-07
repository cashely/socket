const mongoose = require('../db.js');
const Schema = new mongoose.Schema({
    from:String,
    to:String,
    message:String,
    date:{
        type:Date,
        default:new Date()
    }
});
const chat = mongoose.model('chat',Schema);

module.exports = chat;
