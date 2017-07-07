const user = require('../models/user.js');


//根据openId查询用户信息
function getUserFromDb(openId){
    return user
            .findOne()
            .where({
                wxId:openId
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
                .find()
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

//用户完善资料
function editUserInfo(obj){
    return new Promise((resolve,reject)=>{
        new user(obj).save((err,result)=>{
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
        if(req.query.code){
            return res.json({
                statu:0,
                msg:'code必须存在!'
            })
        };

        //通过code获取微信那边的openId



        getUserFromDb(req.query.id)
            .then((result)=>{
                console.log(result);
                if(!!result.length){
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
            hospitalId:req.body.hospitalId
        })
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
    }
}
