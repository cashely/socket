const mongoose = require('../db.js');
const Schema = new mongoose.Schema({
    from:String,
    to:String,
    message:String,
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('offline',Schema);
