// Renderiza frames do scene.html via Chrome headless (CDP), um frame por tempo t.
// Uso: node render.mjs [fps] [duracao] [saida] [t1,t2,...]  (lista de tempos = so stills)
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = +(process.argv[2] || 30), DUR = +(process.argv[3] || 24);
const OUT = process.argv[4] || path.join(here, "frames");
const ONLY = process.argv[5] ? process.argv[5].split(",").map(Number) : null;
mkdirSync(OUT, { recursive: true });

const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--remote-debugging-port=9333", "--hide-scrollbars", "--force-device-scale-factor=1",
  "--window-size=720,1480", `--user-data-dir=${path.join(here, "chrome-profile")}`, "--no-first-run", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch("http://127.0.0.1:9333/json")).json(); if (targets.find((t) => t.type === "page")) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 720, height: 1480, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: pathToFileURL(path.join(here, "scene.html")).href });
await sleep(1200);
await send("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });

const times = ONLY || Array.from({ length: Math.round(FPS * DUR) }, (_, i) => i / FPS);
for (let i = 0; i < times.length; i++) {
  const r = await send("Runtime.evaluate", { expression: `render(${times[i]})` });
  if (r.result?.exceptionDetails) { console.error("erro em t=", times[i], JSON.stringify(r.result.exceptionDetails.exception?.description)); }
  const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 92 });
  const name = ONLY ? `still_${String(times[i]).replace(".", "_")}.jpg` : `f_${String(i + 1).padStart(4, "0")}.jpg`;
  writeFileSync(path.join(OUT, name), Buffer.from(s.result.data, "base64"));
}
ws.close(); chrome.kill();
console.log("ok", times.length);
