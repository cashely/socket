const user = require('../models/user.js');
const chat = require('../models/chat.js');
const {url} = require('../config.js');
const moment = require('moment');
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

//根据id组查询用户信息以及最新数据列表
function getUserList(ids,masterId){
    let list = [],promiseArr = [];
    function getSingle(id){
        return new Promise((resolve,reject)=>{
          user.findOne().where({_id:id}).exec((err,userInfo)=>{
            if(err){
              throw new Error(err);
            }else{
              let _userInfo = !!userInfo ? userInfo.toObject() :{};
              chat.find({}).where({$or:[{from:id,to:masterId},{to:id,from:masterId}]}).exec((err,message)=>{
                if(err){
                  reject(err)
                }else{
                  let _m = message;
                  if(!!_m.length){
                    console.log(_m.length);
                    _m = _m.slice(-1)[0];
                    _m = _m.toObject();
                    _m.date = moment(_m.date).format('a|HH:mm').split('|');
                  }
                  console.log(_m);
                  _userInfo.lastMessage = _m;
                  resolve(_userInfo);
                }
              })
            }
          })
        })
    }
    ids.forEach((item)=>{
        promiseArr.push(getSingle(item))
    });
    return Promise.all(promiseArr);
}

module.exports = {
    index:(req,res,next)=>{
        getFriends(req.query.id)
          .then((result)=>{
              res.locals.getFriends = result;
          })
          .then((_result)=>{
              res.locals.lastMessage = _result;
              getUserInfo(req.query.id).then((result)=>{
                  return result.toObject()
              })
            .then((result)=>{
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
    },
    userList:(req,res,next)=>{
        getUserList(JSON.parse(req.query.ids),req.params.id)
        .then((result)=>{
            res.json({
                statu:1,
                datas:result,
                msg:'获取用户列表成功!'
            })
        })
        .catch((err)=>{
            res.json({
                statu:0,
                msg:'获取用户列表失败!'
            })
        })
    }
};
