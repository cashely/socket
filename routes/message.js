const user = require('../models/user.js');
const chat = require('../models/chat.js');
//获取离线信息
function getOffLineMessageById(id){
    return user
            .findOne()
            .where({_id:id})
            .select('message')
            .exec((err,result)=>{
                if(err){
                    throw new Error(err)
                }else{
                    return new Promise((resolve,reject)=>{
                        user
                            .update({_id:id},{$set:{message:[]}},(err)=>{
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(result);
                                }
                            })
                    })
                }
            })
}

//根据用户id获取当前聊天记录
function getHistoryMessage(from,to){
    return chat
            .find()
            .where({$or:[{from:from,to:to},{from:to,to:from}]})
            .sort({date:1})
            .exec((err,result)=>{
                if(err){
                    throw new Error(err);
                }else{
                    return result;
                }
            })
}

module.exports = {
    offline:(req,res,next)=>{
        getOffLineMessageById(req.params.id)
            .then((result) => {
                res.json({
                    statu:1,
                    datas:result,
                    msg:'获取离线信息成功!'
                })
            })
            .catch((err)=>{
                res.json({
                    statu:0,
                    msg:'获取离线信息失败!'
                })
            })
    },
    history:(req,res,next)=>{
        if(!req.query.from){
            return res.json({
                statu:0,
                msg:'用户id必须存在!'
            })
        }
        if(!req.query.to){
            return res.json({
                statu:0,
                msg:'对方用户的id必须存在!'
            })
        }
        getHistoryMessage(req.query.from,req.query.to)
            .then((result)=>{
                res.json({
                    statu:1,
                    msg:'获取对话列表成功!',
                    datas:result
                })
            })
            .catch((err)=>{
                res.json({
                    statu:0,
                    msg:'获取对话列表失败!'
                })
            })
    }
}
