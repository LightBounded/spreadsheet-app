import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Point } from "react-spreadsheet";
import { Server } from "socket.io";

const prisma = new PrismaClient();
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
const getNewStateFromData = (data: typeof currentState) => {
  return data.map((row, rowIndex) =>
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

  socket.on("cellSelect", (cells: Point[]) => {
    selectedCells = cells;
    const newData = getNewStateFromData(currentState);
    currentState = newData;
    socket.broadcast.emit("dataChange", currentState);
  });

  socket.on("dataChange", (data: typeof currentState) => {
    const newState = getNewStateFromData(data);
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
