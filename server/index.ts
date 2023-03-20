import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Point } from "react-spreadsheet";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = createServer(app);
const socket = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let currentState = [
  [{ value: "" }, { value: "" }],
  [{ value: "" }, { value: "" }],
];

let selectedCells: Point[] = [];

// TODO: Rename
const getNewState = () => {
  return currentState.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      const isSelected = selectedCells.some(
        (selectedCell) =>
          selectedCell.row === rowIndex && selectedCell.column === columnIndex
      );

      return {
        ...cell,
        className: isSelected ? "selected" : "",
      };
    })
  );
};

socket.on("connection", (socket) => {
  console.log("a user has connected");

  socket.on("getCurrentState", () => {
    socket.emit("dataChange", currentState);
  });

  socket.on("cellSelect", (cells) => {
    selectedCells = cells;
    const newData = getNewState();
    currentState = newData;
    socket.broadcast.emit("dataChange", currentState);
  });

  socket.on("dataChange", (data: typeof currentState) => {
    const newState = getNewState();
    currentState = newState;
    socket.broadcast.emit("dataChange", currentState);
  });

  socket.on("disconnect", () => {
    console.log("a user has a disconnected");
  });
});

// Endpoint to test connection
app.get("/ping", (req, res) => {
  res.send("pong!");
});

server.listen(3000, () => {
  console.log("server listening on port 3000");
});
