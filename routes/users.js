const user = require('../models/user.js');
const chat = require('../models/chat.js');


//根据openId查询用户信息
function getUserFromDb(id){
    return user
            .findOne()
            .where({
                _id:id
            })
            .exec((err,result)=>{
                if(err){
                    throw new Error('查询用户出错!');
                }else{
                    return result;
                }
            })
}

function findUserByWxId(wxId){
    return user
                .findOne()
                .where({wxId:wxId})
                .exec((err,result)=>{
                    if(err){
                        throw new Error(err);
                    }else{
                        return result;
                    }
                })
}

function addUser(obj){
    return new Promise((resolve,reject)=>{
        new user(obj).save((err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}

//根据用户id添加诊疗卡
function addCrad(id,cradId,hosName){
    return new Promise((resolve,reject)=>{
        user.update({_id:id},{$push:{crads:{id:cradId,hospitalName:hosName}}},(err,result)=>{
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        })
    })
}

//用户完善资料
function editUserInfo(obj,id){
    return new Promise((resolve,reject)=>{
        user.update({_id:id},{$set:obj},(err,result)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(result);
                    }
             })
    })
}

module.exports = {
    info:(req,res,next)=>{
        let userInfo;
        if(!req.params.id){
            return res.json({
                statu:0,
                msg:'id必须存在!'
            })
        };

        getUserFromDb(req.params.id)
            .then((result)=>{
                console.log(result);
                if(!!result){
                    res.json({
                        statu:1,
                        datas:result,
                        msg:'获取用户信息成功!'
                    });
                }else{
                    res.json({
                        statu:0,
                        msg:'该用户不存在!'
                    })


                }
            })
    },
    add:(req,res,next)=>{
        if(!req.query.wId ){
            return res.json({
                statu:0,
                msg:'id必须存在!'
            })
        }

        findUserByWxId(req.query.wId)
            .then(result => {
                if(!result.length){
                    addUser({
                        wxId:req.query.wId,
                        wxName:req.query.wName,
                        wxImage:req.query.wImage
                    })
                    .then((result)=>{
                        return res.json({
                            statu:1,
                            msg:'存储用户成功!',
                            datas:result.wxId
                        })
                    })
                }else{
                    return res.json({
                        statu:0,
                        msg:`用户${req.query.wId}已经存在!`
                    })
                }
            })
    },
    edit:(req,res,next)=>{
        editUserInfo({
            phone:req.body.phone,
            name:req.body.name,
            sex:req.body.sex,
            hospitalId:req.body.hospitalId,
            mark:req.body.mark
        },req.body.id)
        .then((result)=>{
            res.json({
                statu:1,
                msg:'更新用户信息成功!'
            })
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                statu:0,
                msg:'更新用户信息失败!'
            })
        })
    },
    addCrad:(req,res,next)=>{
        if(!req.body.cradId || !req.body.hospitalName){
            return res.json({
                statu:0,
                msg:'诊疗卡号或者医院必须能存在!'
            })
        }
        addCrad(req.params.id,req.body.cradId,req.body.hospitalName)
        .then((result)=>{
            return res.json({
                statu:1,
                msg:'添加诊疗卡号成功!'
            })
        })
        .catch((err)=>{
            return res.json({
                statu:0,
                msg:err
            })
        })
    },
    deleteCrad:(req,res,next)=>{
        user.update({"_id":req.params.id},{$pull:{type:{id:req.body.cradId}}},(error,result)=>{
            if(error){
                res.json({
                    statu:0,
                    msg:error
                })
            }else{
                res.json({
                    statu:1,
                    msg:'删除成功!'
                })
            }
        })
    },
    statu:(req,res,next)=>{
        getUserFromDb(req.params.id)
        .then((result)=>{
            return result.toObject()
        })
        .then(result=>{
            if(!result.name || !result.phone || !result.name || !result.hospitalId){
                return res.json({
                    statu:1,
                    datas:true,
                    msg:'用户信息缺少字段'
                })
            }else{
                return res.json({
                    statu:1,
                    datas:false
                })
            }
        })
        .catch((err)=>{
            return res.json({
                statu:0,
                msg:'查询用户信息状态出错!'
            })
        })
    }
}
