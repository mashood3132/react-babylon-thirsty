import React from "react";
import ReactDOM from "react-dom";
import Template from "./Template";
import "./styles.css";

function App() {
  return (
    <div className="App">
      <h1>Hello Babylon</h1>
      <Template />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
