import express from "express"
import dotenv from "dotenv"
import router from "./routes/auth.routes.js"
import messageRoutes from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import path from "path"

dotenv.config();

const PORT = process.env.PORT //|| 5001;

const __dirname = path.resolve();

app.use(express.json());//allow you to extract to json data out of box
app.use(cookieParser()); // to parse the cookie


//cors connect the front end and backend 
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}
))


app.use("/api/auth", router)
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {  //any route will send to our chatup index.html file
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

server.listen(PORT, () => {
    console.log("Server is started on port:" + PORT);
    connectDB();
})