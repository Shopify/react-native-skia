// Collects the results the benchmark screens post, captures Android-side
// statistics around each phase over adb, and hands the app the next
// benchmark to run.
//
//   POST /result  {bench, version, platform, phases, ...}
//   POST /event   {bench, version, platform, phase, params, action: start|end}
//   POST /plan    ["HeavyCanvas", "ManyCanvases", ...]   queue of routes
//   GET  /next    -> {route} pops the queue (the List screen polls this)
//   GET  /plan    -> the queue
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.join(__dirname, "results");
fs.mkdirSync(dir, { recursive: true });
const port = Number(process.env.PORT || 4299);
const pkg = process.env.ANDROID_PACKAGE || "com.microsoft.reacttestapp";

// One queue per device: Android reaches us over adb reverse (loopback), the
// iPhone over the network.
const plans = { android: [], ios: [] };
const lastPoll = {};
const platformOf = (req, url) =>
  url.searchParams.get("platform") ||
  (/^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(req.socket.remoteAddress) ? "android" : "ios");
const captures = new Map();

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const adb = (args, opts = {}) => {
  try {
    return execFileSync("adb", args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...opts,
    });
  } catch (e) {
    return `adb error: ${e.message}`;
  }
};

const pidOf = () => adb(["shell", "pidof", pkg]).trim().split(/\s+/)[0] || "";

// utime+stime per thread of the app, in milliseconds (CLK_TCK is 100).
const threadCpu = (pid) => {
  if (!pid) {
    return {};
  }
  const out = adb([
    "shell",
    `for t in /proc/${pid}/task/*; do echo "$(cat $t/comm)|$(cat $t/stat)"; done`,
  ]);
  const cpu = {};
  for (const line of out.split("\n")) {
    const bar = line.indexOf("|");
    if (bar < 0) {
      continue;
    }
    const comm = line.slice(0, bar).trim();
    const stat = line.slice(bar + 1);
    const close = stat.lastIndexOf(")");
    const fields = stat.slice(close + 2).split(/\s+/);
    // fields[0] is state (field 3 of stat); utime is field 14, stime 15.
    const utime = Number(fields[11]);
    const stime = Number(fields[12]);
    if (Number.isFinite(utime) && Number.isFinite(stime)) {
      const key = cpu[comm] === undefined ? comm : `${comm}#${Object.keys(cpu).length}`;
      cpu[key] = (utime + stime) * 10;
    }
  }
  return cpu;
};

const cpuDelta = (before, after) => {
  const out = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== undefined) {
      out[key] = after[key] - before[key];
    }
  }
  return out;
};

// Groups thread CPU by role.
const cpuByRole = (delta) => {
  const roles = { main: 0, js: 0, renderThread: 0, skiaPool: 0, hwui: 0, other: 0 };
  for (const [name, ms] of Object.entries(delta)) {
    const n = name.replace(/#\d+$/, "");
    if (n.startsWith("RNSkia Render")) {
      roles.skiaPool += ms;
    } else if (n === "RenderThread") {
      roles.renderThread += ms;
    } else if (n.startsWith("hwuiTask")) {
      roles.hwui += ms;
    } else if (n === "mqt_js" || n === "mqt_v_js") {
      roles.js += ms;
    } else if (n === "main" || n.endsWith("reacttestapp") || n === "osoft.reacttestapp") {
      roles.main += ms;
    } else {
      roles.other += ms;
    }
  }
  return roles;
};

const parseTimestats = (text) => {
  const layers = {};
  const global = text.match(/renderRate = (\d+) fps/);
  if (global) {
    layers.__renderRate = Number(global[1]);
  }
  const blocks = text.split(/layerName = /).slice(1);
  for (const block of blocks) {
    const name = block.split("\n")[0].trim();
    const num = (key) => {
      const m = block.match(new RegExp(`${key} = ([\\d.]+)`));
      return m ? Number(m[1]) : null;
    };
    const hist = block.match(/presentToPresent histogram is as below:\n([^\n]*)/);
    layers[name] = {
      totalFrames: num("totalFrames"),
      droppedFrames: num("droppedFrames"),
      jankyFrames: num("jankyFrames"),
      averageFPS: num("averageFPS"),
      presentToPresent: hist ? hist[1].trim() : null,
    };
  }
  return layers;
};

const parseGfxinfo = (text) => {
  const num = (key) => {
    const m = text.match(new RegExp(`${key}: (\\d+)`));
    return m ? Number(m[1]) : null;
  };
  const pct = (key) => {
    const m = text.match(new RegExp(`${key}: (\\d+)ms`));
    return m ? Number(m[1]) : null;
  };
  return {
    totalFrames: num("Total frames rendered"),
    jankyFrames: num("Janky frames"),
    p50Ms: pct("50th percentile"),
    p90Ms: pct("90th percentile"),
    p95Ms: pct("95th percentile"),
    p99Ms: pct("99th percentile"),
  };
};

const startCapture = (key) => {
  const pid = pidOf();
  adb(["shell", "dumpsys", "SurfaceFlinger", "--timestats", "-clear"]);
  adb(["shell", "dumpsys", "SurfaceFlinger", "--timestats", "-enable"]);
  adb(["shell", "dumpsys", "gfxinfo", pkg, "reset"]);
  captures.set(key, { pid, cpu: threadCpu(pid), startedAt: Date.now() });
};

const endCapture = (key) => {
  const started = captures.get(key);
  captures.delete(key);
  const pid = started ? started.pid : pidOf();
  const timestatsRaw = adb(["shell", "dumpsys", "SurfaceFlinger", "--timestats", "-dump"]);
  adb(["shell", "dumpsys", "SurfaceFlinger", "--timestats", "-disable"]);
  const gfxinfoRaw = adb(["shell", "dumpsys", "gfxinfo", pkg]);
  const cpuAfter = threadCpu(pid);
  const elapsedMs = started ? Date.now() - started.startedAt : null;
  const delta = started ? cpuDelta(started.cpu, cpuAfter) : {};
  const roles = cpuByRole(delta);
  const perSecond = {};
  if (elapsedMs) {
    for (const [k, v] of Object.entries(roles)) {
      perSecond[k] = Math.round((v * 1000) / elapsedMs);
    }
  }
  return {
    pid,
    elapsedMs,
    timestats: parseTimestats(timestatsRaw),
    gfxinfo: parseGfxinfo(gfxinfoRaw),
    cpuMs: delta,
    cpuByRoleMs: roles,
    cpuByRoleMsPerSecond: perSecond,
    raw: { timestats: timestatsRaw, gfxinfo: gfxinfoRaw },
  };
};

const save = (name, data) => {
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
  console.log(`[${new Date().toISOString()}] ${name}`);
};

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("content-type", "application/json");
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/next") {
      const platform = platformOf(req, url);
      const plan = plans[platform];
      const now = Date.now();
      if (!lastPoll[platform] || now - lastPoll[platform] > 30000) {
        console.log(`poll from ${req.socket.remoteAddress} (${platform})`);
        lastPoll[platform] = now;
      }
      const route = plan.length > 0 ? plan.shift() : null;
      if (route) {
        console.log(`next (${platform}) -> ${route} (${plan.length} left)`);
      }
      res.end(JSON.stringify({ route }));
      return;
    }
    if (req.method === "GET" && url.pathname === "/plan") {
      res.end(JSON.stringify(plans));
      return;
    }
    if (req.method === "GET") {
      res.end(JSON.stringify({ ok: true, plans }));
      return;
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (url.pathname === "/plan") {
          const platform = url.searchParams.get("platform") || "android";
          plans[platform] = Array.isArray(data) ? data : [];
          console.log(`plan (${platform}): ${plans[platform].join(", ")}`);
          res.end(JSON.stringify(plans));
          return;
        }
        if (url.pathname === "/event") {
          const key = `${data.bench}-${data.phase}`;
          const tag = `${data.bench}-${data.phase}-${data.version}-${data.platform}`;
          if (data.platform === "android") {
            if (data.action === "start") {
              startCapture(key);
              console.log(`capture start ${tag}`);
            } else if (data.action === "end") {
              const capture = endCapture(key);
              save(`event-${tag}-${stamp()}.json`, { ...data, capture });
            }
          } else {
            console.log(`event ${tag} ${data.action}`);
          }
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        data.receivedAt = new Date().toISOString();
        save(`${data.bench || "bench"}-${data.version || "v"}-${data.platform || "p"}-${stamp()}.json`, data);
        fs.appendFileSync(path.join(dir, "results.ndjson"), JSON.stringify(data) + "\n");
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error("bad body", e.message, body.slice(0, 200));
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  })
  .listen(port, "0.0.0.0", () => console.log(`results server on ${port}, package ${pkg}`));
