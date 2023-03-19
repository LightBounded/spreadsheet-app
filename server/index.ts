import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = createServer(app);
const socket = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let data: any[][] = [];

socket.on("connection", (socket) => {
  console.log("a user has connected");

  socket.on("getCurrentState", () => {
    socket.emit("dataChange", data);
  });

  socket.on("dataChange", (newData) => {
    data = newData;
    socket.broadcast.emit("dataChange", newData);
  });

  socket.on("cellSelect", (selectedCells) => {
    socket.broadcast.emit("cellSelect", selectedCells);
  });

  socket.on("disconnect", () => {
    console.log("a user has a disconnected");
  });
});

app.get("/ping", (req, res) => {
  res.send("pong!");
});

server.listen(3000, () => {
  console.log("server listening on port 3000");
});
