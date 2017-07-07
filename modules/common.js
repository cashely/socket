const moment = require('moment');
const crypto = require('crypto');
module.exports = {
    singleDateFormat:(obj)=>{
        // console.dir(obj[0]);
        obj = obj.toObject();
        obj.date = moment(obj.date).format('YYYY-MM-DD');
        return obj;
    },
    dateFormat(arr){
        let _n = [];
        arr.forEach((item)=>{
            // console.log(item,'item');
            item = this.singleDateFormat(item);
            _n.push(item)
        })
        return _n;
    },
    getTimeStamp(){
        return parseInt(new Date().getTime()/1000)
    },
    getRandomString(){
        let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = [];
        for(let i=0;i<20;i++){
            key.push(str[(Math.floor(Math.random()*str.length))])
        }
        return key.join('');
    },
    shaString(keysArr,obj){
        console.log(obj,'sign obj');
        let sha1 = crypto.createHash('sha1');
        urlString=[];
        keysArr.forEach((item)=>{
            urlString.push(`${item}=${obj[item]}`);
        })
        urlString = urlString.join('&');
        sha1.update(urlString);
        return sha1.digest('hex');
    },
    md5String(keysArr,obj){
        let md5 = crypto.createHash('md5');
        urlString=[];
        keysArr.forEach((item)=>{
            urlString.push(`${item}=${obj[item]}`);
        })
        urlString = urlString.join('&');
        urlString += `&key=y3n3PqgbRWYmOu3qujimUbdBbAyiVOA6`;
        console.log(urlString,'string');
        md5.update(urlString,'utf8');
        return md5.digest('hex').toUpperCase();
    },
    getTrade(){
        return Math.random().toString(32).slice(2,15);
    },
    getClientIp(req){
        return req.ip.slice(req.connection.remoteAddress.lastIndexOf(':')+1)
    }
}
