import express from "express"
import { Server } from "socket.io"
import {createServer} from "http"
import cors from "cors"

const app=express()


const server=createServer(app)

const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["POST","GET"],
        credentials:true,
    }
})



app.use(cors());

app.get("/",(req,res)=>{
    res.send("Hello world")
})


io.on("connection",(socket)=>{
    console.log("User connected Socket id :",socket.id);
    socket.emit("welcome","Welcome to the server");

    socket.on("message",({roomName,message})=>{
        console.log({roomName,message})
        io.to(roomName).emit("message",{name:socket.id,message});
    })

    socket.on("join-room",(room)=>{
        console.log("User joined Room : ".room)
        socket.join(room)
    })

    socket.on("disconnect",()=>{
        console.log("User Disconnected",socket.id)
    })

})

server.listen(3000,()=>{
    console.log("Server is live")
}) 