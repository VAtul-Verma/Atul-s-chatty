import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },

})

//used to get the msg id from message controller in backend
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}


//use to Store the Online Users
const userSocketMap = {}   //Store the data in the format {userId:socketId}   userId-->from dataBase  , socketId-->socket.id

io.on("connection", (socket) => {
    console.log("A User Connected", socket.id)
    const userId = socket.handshake.query.userId;   //useed in backend useAuthSore
    if (userId) userSocketMap[userId] = socket.id

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
        console.log("A User disconnected ", socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})



export { io, app, server };
