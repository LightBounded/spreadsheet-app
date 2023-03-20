import { useEffect, useState } from "react";
import Spreadsheet, { Point } from "react-spreadsheet";
import { socket } from "./socket";

function App() {
  const [data, setData] = useState([
    [{ value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }],
  ]);

  const [selected, setSelected] = useState<Point[]>([]);

  useEffect(() => {
    socket.emit("getCurrentState");

    const onDataChange = (newData: typeof data) => setData(newData);

    socket.on("dataChange", onDataChange);

    return () => {
      socket.off("dataChange", onDataChange);
    };
  }, [setData]);

  return (
    <>
      <Spreadsheet
        data={data}
        onSelect={(p) => {
          setSelected(p);
          socket.emit("cellSelect", p);
        }}
        onChange={(d) => {
          const newData = d.map((row, rowIndex) =>
            row.map((cell, columnIndex) => {
              const isSelected = selected.some(
                (cell: any) =>
                  cell.row === rowIndex && cell.column === columnIndex
              );

              return {
                ...cell,
                className: isSelected ? "border-2 border-blue-500" : "",
              };
            })
          );
          socket.emit("dataChange", newData);
        }}
      />
    </>
  );
}

export default App;
