import React from "react";
import ReactDOM from "react-dom/client";

import App from "@root/App";
import "@root/index.css";

import DependencyInject from "@library/DependencyIndect";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

DependencyInject();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
