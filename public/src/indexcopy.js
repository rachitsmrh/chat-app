const express =require('express');
const http =require('http');
const path=require('path');
const socketio=require('socket.io')

const app=express();
const server=http.createServer(app);
const io=socketio(server);



const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));

let count=0;
io.on('connection',(socket)=>{
    console.log('New Websocket connection')

    socket.emit('countUpdated',count)

    socket.on('increment',()=>{
        count++;
        //socket.emit('countUpdated',count)
        io.emit('countUpdated',count)
    })
})
const port=process.env.Port ||3000;

server.listen(port,()=>console.log(`Server running on port ${port}`));
