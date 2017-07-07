

const jwt = require('jsonwebtoken');
const cer = 'socket123';
const user = require('../models/user.js');

//根据openId查询用户信息
function getUserById(id){
    return user
            .findOne()
            .where({$or:[{_id:id},{phone:id}]})
            .exec((err,result)=>{
                console.log(result);
                if(err){
                    throw new Error('查询用户出错!');
                }else{
                    return result;
                }
            })
}


//master登录
function findMasterByPhoneAndPassword(phone,password){
    return user
            .findOne()
            .where({
                phone:phone,
                password:password
            })
            .exec((err,result)=>{
                if(err){
                    throw new Error()
                }else{
                    return result;
                }
            })
}



module.exports = {
    user:(req,res,next)=>{
        let userInfo;
        if(!req.params.id){
            return res.json({
                statu:0,
                msg:'用户wId必须存在!'
            })
        }
        getUserById(req.params.id)
            .then((result)=>{
                if(!!result){
                    userInfo = {
                        id:result._id
                    }
                    console.log(userInfo.id);

                    const token = jwt.sign(userInfo,cer,{expiresIn:60*60});
                    res.json({
                        statu:1,
                        datas:token,
                        msg:'获取token信息成功!'
                    });
                }else{
                    res.json({
                        statu:0,
                        msg:'该用户不存在!'
                    })
                }
            })
    },
    master:(req,res,next)=>{
        let userInfo;
        if(!req.params.phone || !req.params.password){
            return res.json({
                statu:0,
                msg:'phone||password字段必须存在!'
            })
        }
        findMasterByPhoneAndPassword(req.params.phone,req.params.password)
            .then(result => {
                if(!result){
                    res.json({
                        statu:0,
                        msg:'该master不存在!'
                    })
                }else{
                    userInfo = {
                        id:result._id
                    }
                    console.log(userInfo.id);

                    const token = jwt.sign(userInfo,cer,{expiresIn:60*60});
                    res.json({
                        statu:1,
                        datas:token,
                        msg:'获取token信息成功!'
                    });
                }
            })
    }
}
