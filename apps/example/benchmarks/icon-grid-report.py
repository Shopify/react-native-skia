#!/usr/bin/env python3
"""Writes the icon grid benchmark page (an HTML artifact) from
results/icon-grid-aggregate.json. usage: icon-grid-report.py <out.html>"""
import html
import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
agg = json.load(open(os.path.join(here, "results", "icon-grid-aggregate.json")))
out_path = sys.argv[1]

counts = ["25", "50", "100", "200"]
series = [
    ("v2", "s-v2", "v2.15 (2.x)"),
    ("main", "s-v3", "v3 (main)"),
    ("shared-recorders", "s-v3-fix", "v3 + shared recorders"),
]
devices = [
    ("android", "Pixel 8", "pss", "PSS added by the icons, MB (dumpsys meminfo)"),
    ("ios", "iPhone 14 Pro", "footprint", "Physical footprint added by the icons, MB"),
]


def entry(version, platform):
    return agg.get(f"{version}/{platform}")


def fmt(v, digits=1):
    if v is None:
        return "–"
    if digits == 0:
        return f"{v:,.0f}"
    return f"{v:,.{digits}f}"


def nice_max(v):
    for step in (50, 100, 200, 250, 500, 1000):
        top = ((int(v) // step) + 1) * step
        if top / step <= 6:
            return top, step
    return int(v) + 1, 1


def grouped_bars(title, aria, groups, data, unit, label_last=True, ref=None, digits=0):
    """An SVG column chart: groups of one bar per series. data[series][group]."""
    width, height = 640, 300
    left, right, top, bottom = 48, 624, 28, 256
    values = [v for s in data.values() for v in s.values() if v is not None]
    vmax = max(values) if values else 1
    ymax, step = nice_max(vmax if ref is None else max(vmax, ref))
    scale = (bottom - top) / ymax
    parts = [f'<svg class="chart" viewBox="0 0 {width} {height}" role="img" aria-label="{html.escape(aria)}">']
    y = 0
    while y <= ymax:
        py = bottom - y * scale
        parts.append(f'<line class="grid" x1="{left}" y1="{py:.1f}" x2="{right}" y2="{py:.1f}"/>')
        parts.append(f'<text class="tick" x="{left - 8}" y="{py + 4:.1f}" text-anchor="end">{y:,}</text>')
        y += step
    if ref is not None:
        py = bottom - ref * scale
        parts.append(f'<line class="ref" x1="{left}" y1="{py:.1f}" x2="{right}" y2="{py:.1f}"/>')
        parts.append(f'<text class="ref-label" x="{left + 4}" y="{py - 5:.1f}" text-anchor="start">display 120 Hz</text>')
    n_groups = len(groups)
    n_series = len(series)
    group_w = (right - left) / n_groups
    bar_w = 16
    gap = 2
    cluster_w = n_series * bar_w + (n_series - 1) * gap
    for gi, (gkey, glabel) in enumerate(groups):
        gx = left + gi * group_w + (group_w - cluster_w) / 2
        for si, (skey, sclass, sname) in enumerate(series):
            v = data.get(skey, {}).get(gkey)
            x = gx + si * (bar_w + gap)
            if v is None:
                parts.append(f'<text class="tick" x="{x + bar_w / 2:.1f}" y="{bottom - 4}" text-anchor="middle">n/a</text>')
                continue
            h = v * scale
            tip = f"{glabel} · {sname}: {fmt(v, digits)} {unit}"
            if h > 4:
                d = f"M{x:.1f},{bottom} v-{h - 4:.1f} a4,4 0 0 1 4,-4 h{bar_w - 8} a4,4 0 0 1 4,4 v{h - 4:.1f} z"
            else:
                d = f"M{x:.1f},{bottom} v-{h:.1f} h{bar_w} v{h:.1f} z"
            parts.append(f'<path class="bar {sclass}" d="{d}" data-tip="{html.escape(tip)}"><title>{html.escape(tip)}</title></path>')
            if label_last and gi == n_groups - 1:
                ly = bottom - h - 6
                if ly < top + 10:
                    ly = bottom - h + 14
                parts.append(f'<text class="value" x="{x + bar_w / 2:.1f}" y="{ly:.1f}" text-anchor="middle">{fmt(v, 0)}</text>')
        parts.append(f'<text class="tick" x="{gx + cluster_w / 2:.1f}" y="{bottom + 18}" text-anchor="middle">{html.escape(glabel)}</text>')
    parts.append(f'<line class="axis" x1="{left}" y1="{bottom}" x2="{right}" y2="{bottom}"/>')
    parts.append(f'<text class="tick" x="{left}" y="{height - 6}" text-anchor="start">{html.escape(unit)}</text>')
    parts.append("</svg>")
    legend = "".join(f'<span class="key"><i class="sw {c}"></i>{html.escape(n)}</span>' for _, c, n in series)
    return f'<figure><figcaption>{html.escape(title)}</figcaption><div class="legend">{legend}</div>{"".join(parts)}</figure>'


def memory_table(platform, metric):
    rows = []
    for skey, _, sname in series:
        e = entry(skey, platform)
        if not e:
            continue
        for n in counts:
            c = e["counts"][n]
            added = c.get(f"{metric}AddedMb")
            per = c.get(f"{metric}PerIconMb")
            left = c.get(f"{metric}LeftMb")
            gpu = c.get("gpuAddedMb")
            cells = [f"{n} icons · {sname}", fmt(added, 0), fmt(per, 2), fmt(left, 0)]
            if platform == "android":
                cells.append(fmt(gpu, 0))
            rows.append("<tr>" + "".join(f"<td>{html.escape(x)}</td>" for x in cells) + "</tr>")
    head = ["phase", "added MB", "per icon MB", "left after unmount MB"] + (["GPU added MB"] if platform == "android" else [])
    return "<div class=\"table-wrap\"><table><thead><tr>" + "".join(f"<th>{h}</th>" for h in head) + "</tr></thead><tbody>" + "".join(rows) + "</tbody></table></div>"


def mount_table(platform):
    rows = []
    for skey, _, sname in series:
        e = entry(skey, platform)
        if not e:
            continue
        for n in counts:
            m = e["counts"][n]["mount"]
            runs = " / ".join(fmt(v, 0) for v in m.get("uiMaxMsRuns", []))
            cells = [f"{n} icons · {sname}", fmt(m["uiFps"]), fmt(m["uiP95Ms"]), fmt(m["uiMaxMs"], 0), runs, fmt(m["late"]), fmt(m["commitMs"], 0)]
            rows.append("<tr>" + "".join(f"<td>{html.escape(x)}</td>" for x in cells) + "</tr>")
    head = ["mount phase", "UI fps", "UI p95 ms", "longest stall ms", "per run", "late frames", "JS commit ms"]
    return "<div class=\"table-wrap\"><table><thead><tr>" + "".join(f"<th>{h}</th>" for h in head) + "</tr></thead><tbody>" + "".join(rows) + "</tbody></table></div>"


def device_section(platform, name, metric, caption):
    groups = [(n, f"{n} icons" if n == "25" else n) for n in counts]
    mem = {s: {n: (entry(s, platform) or {"counts": {}})["counts"].get(n, {}).get(f"{metric}AddedMb") for n in counts} for s, _, _ in series}
    fps = {s: {n: (entry(s, platform) or {"counts": {}})["counts"].get(n, {}).get("mount", {}).get("uiFps") for n in counts} for s, _, _ in series}
    fig_a = grouped_bars(f"{name}: {caption}", f"{name}: memory added by the icons", groups, mem, "MB")
    fig_b = grouped_bars(f"{name}: UI thread frames per second while the icons mount", f"{name}: UI thread fps while the icons mount", groups, fps, "fps", ref=120)
    note_a = {
        "android": "Proportional set size of the process read by the results server after the icons have been on screen for four seconds, minus the same reading with no icons. The GPU column is the driver's tracked allocations (GL mtrack).",
        "ios": "Physical footprint of the process, read by the screen itself through a probe on the view API (what Xcode's memory gauge shows), after the icons have been on screen for four seconds, minus the reading with no icons.",
    }[platform]
    return f"""<div><h3>{html.escape(name)}</h3>{fig_a}<p class="note">{note_a}</p>{memory_table(platform, metric)}{fig_b}<p class="note">The UI thread runs Reanimated and the React Native animation. Its frame interval is sampled by a frame callback during the four seconds in which the icons mount; the table adds the longest stall of each run and the time React's commit took on the JS thread.</p>{mount_table(platform)}</div>"""


def raw_json():
    return html.escape(json.dumps(agg, indent=1))


a_main_and = entry("main", "android")["counts"]["200"]
a_br_and = entry("shared-recorders", "android")["counts"]["200"]
a_v2_and = entry("v2", "android")["counts"]["200"]
a_main_ios = entry("main", "ios")["counts"]["200"]
a_br_ios = entry("shared-recorders", "ios")["counts"]["200"]
a_v2_ios = entry("v2", "ios")["counts"]["200"]

page = f"""<title>Icon Grid Benchmark</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
:root {{
  /* Layout: one reading column; the two devices side by side, stacking on phones. */
  --bg: #f7f6f2; --surface: #ffffff; --fg: #1b1a17; --fg-2: #5c5a52; --fg-3: #8d8a7f; --line: #e2dfd5;
  --accent: #2a78d6; --v3: #2a78d6; --v2: #eb6834; --v3fix: #1baf7a; --ref: #8d8a7f;
  --font-text: "Public Sans", "Helvetica Neue", Arial, sans-serif;
  --font-data: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --bg: #151515; --surface: #1e1e1d; --fg: #efede6; --fg-2: #bdbab0; --fg-3: #8d8a7f; --line: #33322f;
    --accent: #3987e5; --v3: #3987e5; --v2: #d95926; --v3fix: #199e70; --ref: #8d8a7f; color-scheme: dark;
  }}
}}
:root[data-theme="dark"] {{
  --bg: #151515; --surface: #1e1e1d; --fg: #efede6; --fg-2: #bdbab0; --fg-3: #8d8a7f; --line: #33322f;
  --accent: #3987e5; --v3: #3987e5; --v2: #d95926; --v3fix: #199e70; --ref: #8d8a7f; color-scheme: dark;
}}
body {{ background: var(--bg); color: var(--fg); font-family: var(--font-text); font-size: 16px; line-height: 1.55;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 0 48px; }}
main {{ max-width: 880px; margin: 0 auto; }}
header.top {{ padding-block: 40px 16px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }}
.eyebrow {{ font-family: var(--font-data); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-3); margin: 0 0 10px; }}
h1 {{ font-size: clamp(28px, 5vw, 40px); line-height: 1.1; margin: 0 0 14px; text-wrap: balance; letter-spacing: -0.01em; }}
.thesis {{ font-size: 19px; line-height: 1.45; color: var(--fg-2); max-width: 66ch; margin: 0 0 18px; text-wrap: pretty; }}
.chips {{ display: flex; flex-wrap: wrap; gap: 8px; }}
.chip {{ font-family: var(--font-data); font-size: 12px; padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--fg-2); background: var(--surface); }}
h2 {{ font-size: 22px; margin: 36px 0 12px; letter-spacing: -0.01em; }}
h3 {{ font-size: 16px; margin: 20px 0 8px; }}
p, li {{ max-width: 68ch; }}
ul {{ padding-left: 20px; }}
li {{ margin-bottom: 6px; }}
a {{ color: var(--accent); }}
code {{ font-family: var(--font-data); font-size: 0.9em; background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: 1px 5px; }}
pre {{ font-family: var(--font-data); font-size: 13px; background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px; overflow-x: auto; }}
.devices {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
.devices > div {{ min-width: 0; }}
figure {{ margin: 0 0 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px 8px; }}
figcaption {{ font-weight: 600; font-size: 14px; margin-bottom: 4px; }}
.legend {{ display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: var(--fg-2); margin-bottom: 4px; }}
.key {{ display: inline-flex; align-items: center; gap: 6px; }}
.sw {{ display: inline-block; width: 10px; height: 10px; border-radius: 2px; }}
.s-v3 {{ fill: var(--v3); background: var(--v3); }}
.s-v2 {{ fill: var(--v2); background: var(--v2); }}
.s-v3-fix {{ fill: var(--v3fix); background: var(--v3fix); }}
svg.chart {{ width: 100%; height: auto; display: block; font-family: var(--font-data); }}
svg .grid {{ stroke: var(--line); stroke-width: 1; }}
svg .axis {{ stroke: var(--fg-3); stroke-width: 1; }}
svg .ref {{ stroke: var(--ref); stroke-width: 1; }}
svg .ref-label, svg .tick, svg .value {{ fill: var(--fg-2); font-size: 11px; }}
svg .value {{ fill: var(--fg); font-weight: 600; }}
svg .bar {{ cursor: default; }}
svg .bar:hover {{ opacity: 0.85; }}
.note {{ font-size: 12.5px; color: var(--fg-3); margin: 6px 0 2px; }}
.table-wrap {{ overflow-x: auto; margin: 10px 0 18px; }}
table {{ border-collapse: collapse; width: 100%; font-size: 13.5px; }}
th, td {{ text-align: right; padding: 6px 8px; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; white-space: nowrap; }}
th:first-child, td:first-child {{ text-align: left; }}
th {{ font-weight: 600; color: var(--fg-2); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }}
.tip {{ position: fixed; pointer-events: none; background: var(--fg); color: var(--bg); font-family: var(--font-data); font-size: 12px; padding: 4px 8px; border-radius: 4px; transform: translate(-50%, -140%); white-space: nowrap; z-index: 20; }}
.tip[hidden] {{ display: none; }}
details {{ margin-top: 16px; }}
summary {{ cursor: pointer; color: var(--fg-2); }}
footer {{ margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--fg-3); font-size: 13px; }}
@media (prefers-reduced-motion: no-preference) {{ svg .bar {{ transition: opacity 120ms; }} }}
:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
</style>
<main>
<header class="top">
<p class="eyebrow">React Native Skia · benchmark 6 · 2026-10-21</p>
<h1>Icon Grid Benchmark</h1>
<p class="thesis">A grid of 25 to 200 small canvases that draw once and then sit still, the icons of a toolbar or a list. On v3 every canvas kept a Graphite recorder of its own, about 4.7 MB each. With the recorders shared across the render pool and one image cache for the whole app, 200 icons cost {fmt(a_br_and['pssAddedMb'], 0)} MB on the Pixel 8 instead of {fmt(a_main_and['pssAddedMb'], 0)} MB and {fmt(a_br_ios['footprintAddedMb'], 0)} MB on the iPhone 14 Pro instead of {fmt(a_main_ios['footprintAddedMb'], 0)} MB, below v2 on the iPhone and level with it on the Pixel.</p>
<div class="chips"><span class="chip">Pixel 8 · Android 17 · 120 Hz forced</span><span class="chip">iPhone 14 Pro · iOS 26.6 · ProMotion on</span><span class="chip">v3: main 925ff32d9</span><span class="chip">v3 + shared recorders: branch shared-recorders 67647726e</span><span class="chip">v2: 2.x branch e634b16dd (2.15 line)</span><span class="chip">release builds · Hermes bytecode</span><span class="chip">two runs per build, means shown</span></div>
</header>
<h2>What it measures</h2>
<p>The screen mounts a grid of <strong>25, 50, 100 and 200 canvases</strong> of 32 points, twelve per row. Each canvas draws three things once: a star path, a letter of the alphabet with the system font, and one 64×64 raster image shared by every canvas, with nothing animating afterwards. For each count the benchmark runs three phases: <em>mount</em> (four seconds, the icons appear inside the measurement), <em>steady</em> (one second of warm-up, then three seconds with the icons on screen) and <em>unmount</em> (three seconds after they are removed).</p>
<p>The headline number is the <strong>memory the icons add</strong>: on the Pixel 8 the results server reads <code>dumpsys meminfo</code> around every phase (proportional set size, plus the GPU allocations the driver tracks), on the iPhone 14 Pro the screen reads the process footprint through a small probe on the view API. The second number is the <strong>UI thread frame rate while the icons mount</strong>, sampled by Reanimated's frame callback, with the longest stall and the JS commit time beside it.</p>
<h2>Results</h2>
<div class="devices">{"".join(device_section(*d) for d in devices)}</div>
<p class="note">Added memory is the steady reading minus the calibration reading of the same run; "left after unmount" is the unmount reading minus the same baseline. Late frames: frame callbacks that arrived more than 1.5× the calibration interval (8.3 ms) after the previous one. Means over two runs; the longest stalls of both runs are listed separately because a single hitch moves the mean.</p>
<h2>Reading the numbers</h2>
<ul>
<li><strong>Memory per icon.</strong> On main every canvas records on a recorder of its own, and a recorder holds its own glyph atlas page, its own upload of the image and its own buffers: 4.5 to 5.1 MB per icon on both devices, so 200 icons add {fmt(a_main_and['pssAddedMb'], 0)} MB on the Pixel ({fmt(a_main_and['gpuAddedMb'], 0)} MB of it tracked as GPU allocations) and {fmt(a_main_ios['footprintAddedMb'], 0)} MB on the iPhone. The branch records every canvas on the recorder of the render thread that replays it (two to four in all) and uploads the shared image once: 0.3 to 0.5 MB per icon, {fmt(a_br_and['pssAddedMb'], 0)} MB and {fmt(a_br_ios['footprintAddedMb'], 0)} MB for 200. What is left is the view itself and its surface (a TextureView buffer queue, a CAMetalLayer drawable).</li>
<li><strong>Against v2.</strong> v2 shares one Ganesh context per thread, so it never paid per view: {fmt(a_v2_and['pssAddedMb'], 0)} MB for 200 icons on the Pixel and {fmt(a_v2_ios['footprintAddedMb'], 0)} MB on the iPhone. The branch lands at the same level on the Pixel and below v2 on the iPhone, where v2's first 25 canvases alone cost 90 MB.</li>
<li><strong>Mounting on the iPhone.</strong> The UI thread stays above 113 fps in every build; the difference is a single hitch. Main's longest stall while 200 icons mount is {fmt(a_main_ios['mount']['uiMaxMs'], 0)} ms (one recorder created and one first frame presented per canvas), the branch's {fmt(a_br_ios['mount']['uiMaxMs'], 0)} ms and v2's {fmt(a_v2_ios['mount']['uiMaxMs'], 0)} ms.</li>
<li><strong>Mounting on the Pixel.</strong> Here v3 pays something this branch does not touch: each TextureView's first Vulkan frame is presented on the main thread (a few milliseconds each, measured separately), so 200 presents hold the UI thread for most of a second: {fmt(a_main_and['mount']['uiFps'], 0)} fps during the mount phase on main, {fmt(a_br_and['mount']['uiFps'], 0)} on the branch, {fmt(a_v2_and['mount']['uiFps'], 0)} on v2. v2's own cost is elsewhere: it draws on the UI thread, so the commit of 200 canvases is one {fmt(a_v2_and['mount']['uiMaxMs'], 0)} ms gap, while a v3 commit takes {fmt(a_br_and['mount']['commitMs'], 0)} to {fmt(a_main_and['mount']['commitMs'], 0)} ms on the JS thread. Presenting off the main thread, or a static mode that draws small canvases into a bitmap-backed view, is the next step for this scenario.</li>
<li><strong>Unmounting.</strong> The iPhone gives the memory back within the three-second phase in every build. The Pixel does not, in any build: the readings after the unmount stay where the steady phase left them, and the next mount reuses that memory rather than growing on top of it (the 50-icon reading is not the 25-icon reading plus 50 icons). Freed Vulkan and HWUI resources are returned later than the phase window.</li>
</ul>
<h2>What changed on the branch</h2>
<ul>
<li>A <code>&lt;Canvas&gt;</code> no longer owns a Graphite recorder. The render thread pool replays its content on the recorder of the thread that picked the job, so a handful of recorders serve every canvas, with their atlases and caches. The <code>makeGraphiteContext</code> path keeps a recorder per target, made lazily, because JS records across calls.</li>
<li>The image provider uploads through <code>makeTextureImage</code> (an upload recorder, submitted at once) into one process-wide cache instead of recording the upload into the first frame that draws the image, which is what makes the shared recorders safe when views present in any order: an image drawn by a hundred canvases is uploaded once.</li>
<li>Both platforms now compile Skia's inline headers with <code>SK_RELEASE</code> in every configuration, matching the prebuilt binaries (a Debug build otherwise trips a ref-count assertion whenever a recorder with an image provider is destroyed).</li>
</ul>
<h2>Reproduce</h2>
<p>The example app's <strong>Benchmarks</strong> section has the screen (Home → 🏁 Benchmarks → 6. Icon grid). It runs its phases on its own, shows the statistics in an overlay and posts them to the results server, which on Android reads <code>dumpsys meminfo</code>, SurfaceFlinger, HWUI and per-thread CPU statistics around every phase over adb and can queue benchmarks for the app to open.</p>
<pre>cd apps/example/benchmarks
ANDROID_PACKAGE=com.reactnativeskia.example node results-server.js   # port 4299, results/*.json
adb reverse tcp:4299 tcp:4299
./run-android.sh &lt;release apk&gt; IconGrid     # installs, opens the list, queues the benchmark
./run-ios.sh &lt;Release ReactTestApp.app&gt; IconGrid
python3 icon-grid-aggregate.py              # means over the runs, results/icon-grid-aggregate.json
python3 icon-grid-report.py out.html        # this page</pre>
<p>Release builds with the JS bundle compiled to Hermes bytecode, through the build scripts of the same folder. The iPhone's display link runs at 120 Hz (<code>CADisableMinimumFrameDurationOnPhone</code>), the Pixel's display is pinned to 120 Hz. The v2 build is the <code>2.x</code> branch with the benchmark screens copied in; its package id differs (<code>com.microsoft.reacttestapp</code>), so the results server is started with that id for its runs. The footprint probe (<code>SkiaViewApi.memoryFootprint()</code>, <code>phys_footprint</code> through <code>task_info</code>) is a benchmark-only addition applied to all three builds.</p>
<details><summary>Aggregated results (JSON)</summary><pre>{raw_json()}</pre></details>
<footer>React Native Skia · icon grid benchmark · Pixel 8 and iPhone 14 Pro · 2026-10-21</footer>
</main>
<div class="tip" id="tip" hidden></div>
<script>
(function () {{
  var tip = document.getElementById("tip");
  document.querySelectorAll("svg .bar").forEach(function (bar) {{
    bar.addEventListener("mousemove", function (e) {{
      tip.textContent = bar.getAttribute("data-tip");
      tip.style.left = e.clientX + "px";
      tip.style.top = e.clientY + "px";
      tip.hidden = false;
    }});
    bar.addEventListener("mouseleave", function () {{ tip.hidden = true; }});
  }});
}})();
</script>
"""

open(out_path, "w").write(page)
print(f"wrote {out_path} ({len(page)} bytes)")
