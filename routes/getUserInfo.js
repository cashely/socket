const user = require('../models/user.js');
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
module.exports ={
  user:(req,res,next)=>{
        getUserFromDb(req.query.id)
          .then((result)=>{
              res.render('user',{title:"个人中心",datas:result});
          })
  },
  userInfo:(req,res,next)=>{
    getUserFromDb(req.query.id)
      .then((result)=>{
        res.render('userInfo',{title:"完善个人信息",datas:result});
      })
  },
  grade:(req,res,next)=>{
    getUserFromDb(req.query.id)
      .then((result)=>{
        res.render('grade',{title:"评分",datas:result});
      })
  }
}
