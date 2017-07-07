//数据库链接
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const url = 'mongodb://localhost:3010/socket';

try{
    mongoose.connect(url);
}catch(err){
    console.log('链接数据库失败',err)
}

mongoose.connection.on('open',()=>{
    console.log('链接数据库成功!');
})

mongoose.connection.on('error',(err)=>{
    console.log('连接数据库失败!',err);
})

module.exports = mongoose;
