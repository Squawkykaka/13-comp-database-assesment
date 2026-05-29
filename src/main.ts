import { mount } from "svelte";
import App from "./App.svelte";
import "./lobby/lobby.css";
import { parseSettings } from "./lobby/lobby";

await parseSettings();
const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
