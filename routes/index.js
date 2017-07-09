let {wx,url} = require('../config.js');
const user = require('../models/user.js');
const request = require('request');
function getUserInfo(code,from){
    console.log('通过微信获取用户openId');
    return getUserInfoByCode(code)
            .then((codeResult)=>{
                if(!!codeResult){
                    return codeResult;
                }else{
                    return getOpenIdFromCode(code)
                            .then((result)=>{
                            console.log('通过opendId获取用户信息');
                            return getUserInfoFromOpenId(result.openid)
                                    .then((oUserInfo)=>{
                                        if(!oUserInfo){
                                            return getUserInfoFormWx(result.access_token,result.openid)
                                                    .then((_userInfo)=>{
                                                        _userInfo.openId = _userInfo.openid;
                                                        _userInfo.wxUsername = _userInfo.nickname;
                                                        _userInfo.wxImgUrl = _userInfo.headimgurl;
                                                        return saveUserInfo({
                                                               wxId:result.openid,
                                                               wxName:_userInfo.nickname,
                                                               wxImage:_userInfo.headimgurl,
                                                               wxCode:code,
                                                               parent:from
                                                           })
                                                           .then((saveResult)=>{
                                                               return updateMasterFriends(from,saveResult._id)
                                                                       .then((result)=>{
                                                                           return saveResult;
                                                                       });
                                                           })
                                                    })
                                        }else{
                                            return updateCodeById(oUserInfo._id,code,from)
                                                    .then((result)=>{
                                                        return oUserInfo;
                                                    })

                                        }
                                    })

                        })
                }
            })
}


function getOpenIdFromCode(code){
    return new Promise((resolve,reject)=>{
        request(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wx.appId}&secret=${wx.AppSecret}&code=${code}&grant_type=authorization_code`,(err,response,body)=>{
            if(!err){
                body = JSON.parse(body);
                console.log('通过code获取的opendId:',body);
                resolve(body)
            }else{
                reject(err)
            }
        })
    })
}

function getUserInfoFormWx(accessToken,openId){
    return new Promise((resolve,reject)=>{
        request(`https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`,(err,response,body)=>{
            if(!err){
                body = JSON.parse(body);
                resolve(body);
            }else{
                reject(err);
            }
        })
    })
}

function saveUserInfo(obj){
    return new Promise((resolve,reject)=>{
        new user(obj)
            .save((err,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
    })
}

function updateMasterFriends(id,whoId){
    user.findOne().where({_id:id}).exec((err,result)=>{
        if(err){
            throw new Error(err);
        }else{
            if(!!result){
                if(result.friends.indexOf(whoId)=== -1){
                    result.friends.push(whoId);
                    result.markModified('friends');
                    result.save((err,_r)=>{
                        if(err){
                            throw new Error(err);
                        }else{
                            return _r;
                        }
                    })
                }
            }
        }
    })
}

function getUserInfoByCode(code){
    return user
            .findOne()
            .where({wxCode:code})
            .exec((err,result)=>{
                if(err){
                    throw new Error()
                }else{
                    return result;
                }
            })
}

//根据用户id更新code
function updateCodeById(id,code,from){
    let updateUserCode{
        wxCode:code
    }
    if(!!from){
        updateUserCode.parent = from;
    }
    return new Promise((resolve,reject)=>{
        user.update({_id:id},{$set:updateUserCode},(err,result)=>{
            if(err){
              reject(err);
            }else {
              console.log(result,"resultupdateCodeById")
              resolve(result);
            }
        })
    })
}

function getUserInfoFromDb(openId){
    return user
            .find()
            .where({wxId:openId})
            .exec((err,result)=>{
                if(err){
                    throw new Error('根据openId读取用户信息失败:',openId);
                }else{
                    return result;
                }
            })
}

function getUserInfoFromOpenId(openId){
    return user
            .findOne()
            .where({wxId:openId})
            .exec((err,result)=>{
                if(err){
                    throw new Error('根据openId查询数据库里面用户信息失败');
                }else{
                    console.log(openId,'openId');
                    console.log(result,'resultaaaa');
                    return result;
                }
            })
}

function updateUserFrom(id,from){
    return new Promise((resolve,reject)=>{
        user
            .update({_id:id},{$set:{from:from}},(err,result)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(result);
                }
            })
    })
}

module.exports = (req,res,next)=>{
    if(!req.query.code){
        res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wx.appId}&redirect_uri=${url+req.originalUrl}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
    }else{

        getUserInfo(req.query.code,req.query.from)
            .then((userInfo)=>{
              console.log(userInfo.parent,"to")
                res.render('index',{title:userInfo.wxName,id:userInfo._id,parent:userInfo.parent,wxImage:userInfo.wxImage});
            })
    }
}
