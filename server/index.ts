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

let data = [
  [{ value: "" }, { value: "" }],
  [{ value: "" }, { value: "" }],
];

let selectedCells: any[] = [];

socket.on("connection", (socket) => {
  console.log("a user has connected");

  socket.on("getCurrentState", () => {
    socket.emit("dataChange", data);
  });

  socket.on("cellSelect", (cells) => {
    selectedCells = cells;
    const newData = data.map((row, rowIndex) =>
      row.map((cell, columnIndex) => {
        const isSelected = selectedCells.some(
          (cell: any) => cell.row === rowIndex && cell.column === columnIndex
        );

        return {
          ...cell,
          className: isSelected ? "border-2 border-blue-500" : "",
        };
      })
    );
    data = newData;
    socket.broadcast.emit("dataChange", newData);
  });

  socket.on("dataChange", (newData) => {
    data = newData;
    socket.broadcast.emit("dataChange", data);
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
