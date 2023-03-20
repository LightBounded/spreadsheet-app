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
          socket.emit("dataChange", d);
        }}
      />
    </>
  );
}

export default App;
