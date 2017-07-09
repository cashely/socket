const express = require('express');
const server = express().listen(3006);

const users = require('./users.js');
const socketioJwt = require('socketio-jwt');
// io.set('origins','http://socket.immo.cn:3005');
const fs = require('fs');
const io = require('socket.io')(server,{path:'/socket'});
io.origins('*:*');
const user = require('../models/user.js');

const chat = require('../models/chat.js');

//存储聊天记录
function saveChatsById(id,to,message){
    let _msg = new chat({
        from:id,
        to:to,
        message:message
    });
    return new Promise((resolve,reject)=>{
        _msg.save((err,result)=>{
            if(err){
                reject('新增聊天记录失败!');
            }else{
                resolve(result);
            }
        })
    })
}

//存储离线信息
function saveOfflineMessage(id,from,msg){
    console.log(from,'from');
    return new Promise((resolve,reject)=>{
        user
            .findOne()
            .where({_id:id})
            .exec((err,result)=>{
                if(err){
                    throw new Error(err)
                }else{
                    console.log(result);
                    if(!!result){
                        user
                            .update({_id:id},{$push:{message:{from:from,message:msg}}},(err,result)=>{
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(result);
                                }
                            })
                    }else{
                        reject('该用户不存在!')
                    }
                }
            })
    })
}

//根据id获取wxId
function getWxIdById(id){
    return user
        .findOne()
        .where({_id:id})
        .select('wxId')
        .exec((err,result)=>{
            if(err){
                throw new Error(err);
            }else{
                return result;
            }
        })
}

//用户登录、建立会话
function userLoginById(id){
    return new Promise((resolve,reject)=>{
        user
            .update({_id:id},{$set:{login:true,lastDate:new Date()}},(err,result)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
    })
}

//用户退出登录
function userLeaveById(id){
    return new Promise((resolve,reject)=>{
        user
            .update({_id:id},{$set:{login:false}},(err,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
    })
}

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

//获取离线信息
function getOffLineMessageById(id){
    return user
            .findOne()
            .where({_id:id})
            .select('message')
            .exec((err,result)=>{
                if(err){
                    throw new Error(err)
                }else{
                    return new Promise((resolve,reject)=>{
                        user
                            .update({_id:id},{$set:{message:[]}},(err)=>{
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(result);
                                }
                            })
                    })
                }
            })
}

//创建用户列表

let groups = [];

io.on('connection',socketioJwt.authorize({
    secret:'socket123',
    timeout:15000
})).on('authenticated',(socket)=>{
    console.log('一个用户连接上来了!');
    console.log(groups);

    let userInfo =(function(){
        for(let i,l=groups.length;i<l;i++){
            if(socket.decoded_token.id === groups[i]._id){
                groups[i].id = socket.id;
                return groups[i];
            }
        }
        return false;
    })();

    if(!userInfo){
        getWxIdById(socket.decoded_token.id)
            .then((result)=>{
                return getUserFromDb(result.wxId)
            })
            .then((user)=>{
                user = user.toObject();
                groups.push({
                    _id:user._id,
                    name:user.wxName,
                    id:socket.id,
                    wxId:user.wxId
                });

                userInfo = {
                    _id:user._id,
                    name:user.wxName,
                    id:socket.id,
                    wxId:user.wxId
                }

                //发送当前在线用户列表
                io.sockets.emit('userList',groups);

                getOffLineMessageById(userInfo._id)
                    .then((result)=>{
                        if(result.message && result.message.length){
                            socket.emit('offLineMessage',result.message);
                        }

                    })
                socket.emit('connectId',userInfo._id);
                //广播所有客户端新用户加入除当前客户端以外
                socket.broadcast.emit('otherConnect','用户'+userInfo.name+'加入聊天!');

                userLoginById(userInfo._id);
            })
    }else{
        userLoginById(userInfo._id);
        if(userInfo.type===1){
            //发送当前在线用户列表
            io.sockets.emit('userList',groups);
        }

        getOffLineMessageById(userInfo._id)
            .then((messages)=>{
                if(!!messages.length){
                    socket.emit('offLineMessage',messages);
                }
            })
        socket.emit('connectId',{info:userInfo.name});
        //广播所有客户端新用户加入除当前客户端以外
        socket.broadcast.emit('otherConnect','用户'+userInfo.name+'加入聊天!');
    }


    //监听消息事件
    socket.on('message',(message,fn)=>{
        console.log('收到用户发送的信息',message);
        saveChatsById(userInfo._id,message.to,message.info)
            .then((result)=>{
                console.log('发送信息成功!');
            })
            .catch((err)=>{
                console.log(err);
            })
        if(message.to){
            let sid = (function(){
                for(let i =0,l=groups.length;i<l;i++){
                    console.log(message.to,groups[i]._id);
                    if(message.to == groups[i]._id){
                        return groups[i].id;
                    }
                }
            })();
            console.log(sid,groups);
            if(!sid){
                saveOfflineMessage(message.to,userInfo._id,message.info)
                    .then((result)=>{
                        fn('此用户当前不在线!');
                    })
                    .catch((err)=>{
                        fn(err);
                    })
                return;
            }else{
                //向对应的id发送消息
                console.log('需要发送消息的id为:'+sid);
                fn('发送信息成功!');
                socket.to(sid).emit('messages',{from:userInfo.name,info:message.info})

            }
        }else{
            //向所有用户发送信息
            socket.broadcast.emit('messages',{from:userInfo.name,info:message.info})
        }



    });
    //监听用户离开事件

    socket.on('disconnect',(data)=>{
        userLeaveById(userInfo._id)
            .then((result)=>{
                //把此用户删除用户列表
                groups = (()=>{
                    let _nGroups = groups,i=0;
                    for(let l=groups.length;i<l;i++){
                        if(socket.id === groups[i].id){
                            _nGroups = groups.slice(0,i).concat(groups.slice(i+1));
                            break;
                        }
                    }
                    return _nGroups;
                })();
                io.sockets.emit('userList',groups);
            })
    })



})
