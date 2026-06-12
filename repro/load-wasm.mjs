import { loadWasmComponent } from "@terminal3/t3n-sdk";

const startedAt = performance.now();
const component = await loadWasmComponent();

console.log(
  JSON.stringify({
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
    loaded: true,
    durationMs: Math.round(performance.now() - startedAt),
    keys: Object.keys(component),
  }),
);
