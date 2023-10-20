import "./App.css";
import Chart from "./Chart"

function App() {
  return <Chart intArray={[1, 2, 3]} stringArray={["Apples", "Onions", "Starfruits"]} axisColour="red" barColour="red" />;
}

export default App;
