const user = require('../models/user.js');
const {url} = require('../config.js');
const qrcode = require('qrcode');
function findUserByPhone(phone){
    return user
            .find()
            .where({phone:phone})
            .exec((err,result)=>{
                if(err){
                    throw new Error(err);
                }else{
                    return result;
                }
            })
}

const defaultName = ['黄药师','李药师','周药师','文药师'];

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

//评价master
function starForMaster(id,num){
    return new Promise((resolve,reject)=>{
        user
            .update({_id:id},{$inc:{star:Number(num)}},(err,result)=>{
                if(err){
                    console.log(err);
                    reject('评价错误');
                }else{
                    resolve(result);
                }
            })
    })
}

//获取master评价
function getStartById(id){
    return user
            .findOne()
            .where({_id:id})
            .select('star')
            .exec((err,result)=>{
                if(err){
                    throw new Error(err);
                }else{
                    return result;
                }
            })
}
//获取用户信息
function getUserInfo(id){
    return user
      .findOne()
      .where({_id:id})
      .exec((err,result)=>{
          if(err){
              throw new Error('查询用户出错!');
          }else{
              return result;
          }
      })
}

//获取用户列表
function getFriends(id){
    return user
      .find()
      .where({parent:id})
      .exec((err,result)=>{
          if(err){
              throw new Error('查询用户出错!');
          }else{
              return result;
          }
      })
}

//用户完善资料
function editMasterInfo(obj,id){
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
    index:(req,res,next)=>{
        getFriends(req.query.id)
          .then((result)=>{
              res.locals.getFriends = result
          })
          .then((result)=>{
              getUserInfo(req.query.id).then((result)=>{
                  console.log(res.locals.getFriends)
                  qrcode.toDataURL(`${url}?from=${req.query.id}`,(err,image)=>{
                      res.render('master',{title:'管理员',datas:result,getFriends:res.locals.getFriends,qrcode:image});
                  });
              })
          })
    },
    add:(req,res,next)=>{
        if(!req.query.phone){
            return res.json({
                statu:0,
                msg:'电话必须存在!'
            })
        }
        findUserByPhone(req.query.phone)
        .then((result)=>{
            if(!result.length){
                addUser({
                    phone:req.query.phone,
                    password:req.query.password,
                    wxName:req.query.name || defaultName[~~(Math.random()*defaultName.length)]
                })
                .then((result)=>{
                    res.json({
                        statu:1,
                        msg:'添加master成功!'
                    })
                })
            }else{
                res.json({
                    statu:0,
                    msg:`用户${req.query.phone}已经存在!`
                })
            }
        })
    },
    star:(req,res,next)=>{
        console.log(req.params.id);
        starForMaster(req.params.id,req.body.num)
            .then((result)=>{
                res.json({
                    statu:1,
                    msg:'评价成功!'
                })
            })
            .catch((err)=>{
                res.json({
                    statu:0,
                    msg:err
                })
            })
    },
    getStar:(req,res,next)=>{
        getStartById(req.params.id)
            .then((result)=>{
                res.json({
                    statu:1,
                    msg:'获取master评价成功!',
                    datas:result
                })
            })
            .catch((err)=>{
                console.log(err);
                res.json({
                    statu:0,
                    msg:'获取master评价失败!'
                })
            })
    },
    edit:(req,res,next)=>{
        editMasterInfo({
            sex:req.body.sex,
            unit:req.body.unit,
            jobTitle:req.body.jobTitle
        },req.body.id)
        .then((result)=>{
            res.json({
                statu:1,
                msg:'更新药师信息成功!'
            })
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                statu:0,
                msg:'更新药师信息失败!'
            })
        })
    },
    qrcode:(req,res,next)=>{
        qrcode.toDataURL(`${url}?from=${req.params.id}`,(err,image)=>{
            res.render('qrcode',{url:image})
        })
    }
}
