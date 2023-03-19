import { useEffect, useState } from "react";
import Spreadsheet, { Point } from "react-spreadsheet";
import { socket } from "./socket";

function App() {
  const [data, setData] = useState([
    [{ value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }],
  ]);

  useEffect(() => {
    socket.emit("getCurrentState");

    const onDataChange = (newData: typeof data) => {
      if (!newData.length) return;
      setData(newData);
    };

    const onCellSelect = (selectedCells: Point[]) => {
      const newMatrix = data.map((row, rowIndex) =>
        row.map((cell, columnIndex) => {
          const isSelected = selectedCells.some(
            (cell) => cell.row === rowIndex && cell.column === columnIndex
          );

          return {
            ...cell,
            className: isSelected ? "ring" : "",
          };
        })
      );

      setData(newMatrix);
    };

    socket.on("dataChange", onDataChange);
    socket.on("cellSelect", onCellSelect);

    return () => {
      socket.off("dataChange", onDataChange);
      socket.off("cellSelect", onCellSelect);
    };
  }, []);

  return (
    <>
      <Spreadsheet
        data={data}
        onSelect={(p) => socket.emit("cellSelect", p)}
        onChange={(data) => socket.emit("dataChange", data)}
      />
    </>
  );
}

export default App;
