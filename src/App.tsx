import { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import { socket } from "./socket";

function App() {
  const [sheetState, setSheetState] = useState([
    [{ value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }],
  ]);

  useEffect(() => {
    socket.emit("getCurrentState");

    const onDataChange = (newData: typeof sheetState) => setSheetState(newData);

    socket.on("dataChange", onDataChange);

    return () => {
      socket.off("dataChange", onDataChange);
    };
  }, []);

  return (
    <>
      <Spreadsheet
        data={sheetState}
        onSelect={(p) => {
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
