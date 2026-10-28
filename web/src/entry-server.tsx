import { renderToString } from "react-dom/server";
import { App } from "./App.tsx";

export const render = () => renderToString(<App />);
