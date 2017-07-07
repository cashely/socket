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

module.exports = {
    index:(req,res,next)=>{
        res.render('master',{title:'管理员'});
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
                    wxName:defaultName[~~(Math.random()*defaultName.length)]
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
        console.log(req.query.star);
        starForMaster(req.params.id,req.query.star)
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
    }
}
