import express from "express"
import cors from 'cors'
import { Server } from "socket.io"
import http from "http"


const app=express()

app.use(cors())

const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
})



app.get("/",(req,res)=>{
    res.send("Welcome")
})

const rooms={}

io.on("connection",(socket)=>{

    socket.on("join_room",(data)=>{
        const room=data.room;
        if(!rooms[room]){
            rooms[room]={count : 0,aliasCount:0}
        }
        let countTemp=rooms[room].count
        let aliasCountTemp=rooms[room].aliasCount;

        rooms[room]={count:countTemp+1,aliasCount:aliasCountTemp+1}
        const strangerAlias=`Starnger ${rooms[room].aliasCount}`
        socket.join(room)
        socket.emit("alias_assigned",{strangerAlias,count:rooms[room].count})
        socket.to(room).emit("some_added",{count:rooms[room].count})
        console.log(`${socket.id} suceessfully Joined room ${room} with an alias of ${strangerAlias}`)
        console.log(rooms)

    })

    socket.on("leave_room",(data)=>{
        const room=data.room;
        let countTemp=rooms[room].count
        let aliasCountTemp=rooms[room].aliasCount;
        rooms[room]={count:countTemp-1,aliasCount:aliasCountTemp}
        socket.to(room).emit("someone_left",{count:countTemp-1})
    })
    socket.on("send_message",(data)=>{
        const room=data.room;
        socket.to(room).emit("receive_message",{sender:data.sender,message:data.message})
    })

})

server.listen(3001,()=>{
    console.log("SERVER IS LIVE")
})