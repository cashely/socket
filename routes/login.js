const user = require('../models/user.js');
//用户登录、建立会话
function userLoginByWxId(id){
    return new Promise((resolve,reject)=>{
        user
            .update({_id:id},{$set:{login:true,lastDate:new Date()}},(err,result)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
    })
}
//用户退出登录
function userLeaveById(id){
    return new Promise((resolve,reject)=>{
        user
            .update({_id:id},{$set:{login:false}},(err,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
    })
}

module.exports = {
    in:(req,res,next)=>{
        if(req.body.socketId){
            return res.json({
                statu:0,
                msg:'会话id不存在!'
            })
        }
        userLoginById(req.params.id)
            .then(result => {
                res.json({
                    statu:1,
                    msg:'用户登录成功!'
                })
            })
            .catch(err => {
                res.json({
                    statu:0,
                    msg:'用户登录失败'
                })
            })
    },
    out:(req,res,next)=>{
        userLeaveByWxId(req.params.id)
            .then(result => {
                res.json({
                    statu:1,
                    msg:'用户退出成功!'
                })
                .catch(err => {
                    res.json({
                        statu:0,
                        msg:'用户退出失败!'
                    })
                })
            })
    }
}
