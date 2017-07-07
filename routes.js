module.exports = (app)=>{
    //微信认证
    app.get('/MP_verify_WJGBT4nlrlvDmcg7.txt',require('./routes/wx').txt)
    /* GET home page. */
    app.get('/', require('./routes/index.js'));

    app.get('/master',require('./routes/master').index);



    app.get('/token/user/:id',require('./routes/token').user)

    app.get("/token/master/:phone/:password",require('./routes/token').master);

    app.post('/login/:id',require('./routes/login').in)

    app.post('/leave/:id',require('./routes/login').out)

    //获取离线信息
    app.get('/offLineMessage/:id',require('./routes/message').offline)

    app.get('/getUserInfo/:id',require('./routes/users').info)

    app.put('/addUser',require('./routes/users').add)

    app.put('/addMaster',require('./routes/master').add)

    app.get('/history',require('./routes/message').history)

    app.post('/star/:id',require('./routes/master').star)

    app.get('/star/:id',require('./routes/master').getStar)

    app.get('/qrcode/:id',require('./routes/master').qrcode)

    app.post('/editUserInfo/:id',require('./routes/users').edit)


};
