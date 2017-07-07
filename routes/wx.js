var path = require('path');
let {wx} = require('../config.js');

function getAccessToken(){
    return new Promise((resolve,reject)=>{
        request(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wx.appId}&secret=${wx.AppSecret}`,(err,response,body)=>{

            if(!err){
                body = JSON.parse(body);
                console.log(body,'access_token');
                resolve(body.access_token);
            }else{
                reject(err);
            }
        })
    })
}

function getApiTicket(){
    return new Promise((resolve,reject)=>{
        request(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${wx.access_token}&type=jsapi`,(err,response,body)=>{
            body = JSON.parse(body);
            console.log(body,'ticket');
            if(!err){
                resolve(body.ticket);
            }else{
                reject(body.errmsg);
            }
        })
    })
}

function getUrlString(){
    return new Promise((resolve,reject)=>{
        getAccessToken()
            .then((token)=>{
                wx.access_token = token;
                getApiTicket()
                    .then((ticket)=>{
                        console.log(ticket)
                        wx.jsapi_ticket = ticket;
                        wx.noncestr = common.getRandomString();
                        wx.timestamp = common.getTimeStamp();
                        resolve();
                    })
            })
    })
}


function getSignature(url){
    return new Promise((resolve,reject)=>{
        let result={};
        getUrlString()
            .then(()=>{
                wx.url = url;
                let keys = ['jsapi_ticket','noncestr','timestamp','url'].sort();
                wx.signature = common.shaString(keys,wx);
                console.log(wx.signature,'signature');
                resolve();
            })
            .catch((err)=>{
                console.log(err);
            })
    })
}

module.exports = {
    txt:(req,res,next)=>{
        res.sendFile(path.join(__dirname,'../MP_verify_WJGBT4nlrlvDmcg7.txt'));
    },
    init:(req,res,next)=>{
        if(!req.query.url){
            next();
            res.json({
                statu:0,
                msg:'url参数不能为空'
            })
        }
        getSignature(req.query.url)
            .then(()=>{
                let datas = {
                    appId:wx.appId,
                    timestamp:wx.timestamp,
                    noncestr:wx.noncestr,
                    signature:wx.signature
                };
                res.locals.status = 1;
                res.locals.datas = datas;
                next();
                res.json({
                    statu:1,
                    msg:'url参数不能为空',
                    datas:datas
                })
            }).catch((err)=>{
                res.json({
                    statu:0,
                    msg:err
                })
        })
    }
}
