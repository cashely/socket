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
module.exports = (req,res,next)=>{
        getUserFromDb(req.query.id)
          .then((result)=>{
              res.render('pharmacist',{title:"药师信息",datas:result});
          })
}
