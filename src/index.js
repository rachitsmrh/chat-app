const express =require('express');
const http =require('http');
const path=require('path');
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage}=require('./utilis/messages')
const {generateLocationMessage}=require('./utilis/messages')
const app=express();
const server=http.createServer(app);
const io=socketio(server);
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utilis/users')


const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));

io.on('connection',(socket)=>{
    console.log('New Websocket connection')

   
   socket.on('join',({username,room},callback)=>{
     const{error,user} =addUser({id:socket.id,username,room}) 
     if(error){
        return  callback(error)
     }

     socket.join(user.room)
       
    socket.emit('printMessage',generateMessage('Admin','Welcome!'))
    socket.broadcast.to(user.room).emit('printMessage',generateMessage("Admin",`${user.username}  has joined!`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
   callback();
   })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('printMessage',generateMessage(user.username,message))
        callback();
    })
    socket.on('sendLocation',(cords,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${cords.latitude},${cords.longitude}`))
        callback();
    })
    socket.on('disconnect',()=>{
         
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('printMessage',generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })


})
const port=process.env.Port ||3000;

server.listen(port,()=>console.log(`Server running on port ${port}`));