module.exports = (app)=>{
    //微信认证
    app.get('/MP_verify_WJGBT4nlrlvDmcg7.txt',require('./routes/wx').txt);
    /* GET home page. */
    app.get('/', require('./routes/index.js'));

    app.get('/master',require('./routes/master').index);



    app.get('/token/user/:id',require('./routes/token').user);

    app.get("/token/master/:phone/:password",require('./routes/token').master);

    app.post('/login/:id',require('./routes/login').in);

    app.post('/leave/:id',require('./routes/login').out);

    //获取离线信息
    app.get('/offLineMessage/:id',require('./routes/message').offline);

    app.get('/getUserInfo/:id',require('./routes/users').info);

    app.put('/addUser',require('./routes/users').add);

    app.get('/getUserInfoStatu/:id',require('./routes/users').statu);

    //添加诊疗卡号
    app.post('/addCrad/:id',require('./routes/users').addCrad);

    app.put('/addMaster',require('./routes/master').add);

    //根据masterId查询用户信息以及最新消息
    app.get('/userList/:id',require('./routes/master').userList);

    app.get('/history',require('./routes/message').history);

    app.post('/star/:id',require('./routes/master').star);

    app.get('/star/:id',require('./routes/master').getStar);

    app.get('/qrcode/:id',require('./routes/master').qrcode);

    app.post('/editMasterInfo/:id',require('./routes/master').edit);

    app.post('/editUserInfo/:id',require('./routes/users').edit);

    //患者信息
    app.get('/user',require('./routes/getUserInfo').user);
    //完善患者信息
    app.get('/userInfo',require('./routes/getUserInfo').userInfo);
    //保存患者信息
    app.get('/saveUserInfo',function(req,res,next){
        res.render('saveUserInfo',{title:"完善个人信息"});
    });
    //药师列表
    app.get('/masterList',function(req,res,next){
        res.render('masterList',{title:"药师列表"});
    });
    //药师信息
    app.get('/pharmacist',require('./routes/getMasterInfo'));
    //患者评分
    app.get('/grade',require('./routes/getUserInfo').grade);
    //评分成功
    app.get('/gradeSucceed',function(req,res,next){
        res.render('gradeSucceed',{title:"评分",id:req.query.id});
    });
    //pc登录界面
    app.get('/login',function(req,res,next){
        res.render('login',{title:"华侨医院"});
    });
    //pc聊天界面
    app.get('/chat',function(req,res,next){
        res.render('chat',{title:"华侨医院"});
    });
};
