#!/usr/bin/env python3
"""Prints the benchmark results collected so far as tables, one per
benchmark, with the Android captures (SurfaceFlinger, gfxinfo, thread CPU)
joined to their phases. Latest result per (bench, version, platform) wins."""
import glob
import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
results_dir = os.path.join(here, "results")

results = {}
for f in sorted(glob.glob(os.path.join(results_dir, "*.json"))):
    name = os.path.basename(f)
    if name.startswith("event-"):
        continue
    d = json.load(open(f))
    if "phases" not in d:
        continue
    results[(d["bench"], d["version"], d["platform"])] = (name, d)

events = {}
for f in sorted(glob.glob(os.path.join(results_dir, "event-*.json"))):
    d = json.load(open(f))
    events[(d["bench"], d["phase"], d["version"], d["platform"])] = d.get("capture")


def fmt(v, digits=1):
    if v is None:
        return "-"
    if isinstance(v, float):
        return f"{v:.{digits}f}"
    return str(v)


def layer_fps(capture):
    """Frames per second of each SurfaceFlinger layer of the app."""
    if not capture or not capture.get("timestats"):
        return {}
    out = {}
    elapsed = capture.get("elapsedMs") or 0
    for name, layer in capture["timestats"].items():
        if name.startswith("__") or not isinstance(layer, dict):
            continue
        short = "window" if name.startswith("VRI-") else ("surfaceview" if "SurfaceView" in name else name[:24])
        total = layer.get("totalFrames") or 0
        out[short] = (total * 1000 / elapsed) if elapsed else None
    return out


benches = sorted({k[0] for k in results})
for bench in benches:
    print(f"\n=== {bench} ===")
    for (b, version, platform), (name, d) in sorted(results.items()):
        if b != bench:
            continue
        print(f"\n-- {version} / {platform}  ({name})")
        header = f"{'phase':<18}{'UI fps':>8}{'UI p95':>8}{'late':>6}{'JS fps':>8}"
        print(header + "   android capture")
        for p in d["phases"]:
            cap = events.get((bench, p["name"], version, platform))
            extra = ""
            if cap:
                fps = layer_fps(cap)
                roles = cap.get("cpuByRoleMsPerSecond") or {}
                gfx = cap.get("gfxinfo") or {}
                extra = " ".join(f"{k}={fmt(v)}fps" for k, v in fps.items())
                extra += f" | cpu ms/s main={roles.get('main')} js={roles.get('js')} pool={roles.get('skiaPool')} render={roles.get('renderThread')}"
                if gfx.get("totalFrames"):
                    extra += f" | hwui frames={gfx['totalFrames']} janky={gfx['jankyFrames']} p50={gfx['p50Ms']} p90={gfx['p90Ms']} p99={gfx['p99Ms']}"
            ex = p.get("extra") or {}
            if "jsMeanMs" in ex:
                gc = ex.get("gcDelta") or {}
                extra += f" | js/interaction mean={fmt(ex['jsMeanMs'])} p95={fmt(ex['jsP95Ms'])} max={fmt(ex['jsMaxMs'])} GCs={gc.get('js_numGCs')} gcTime={fmt((gc.get('js_gcTime') or 0) * 1000)}ms"
            print(
                f"{p['name']:<18}{fmt(p['ui']['fps']):>8}{fmt(p['ui']['p95Ms']):>8}{p['ui']['late']:>6}{fmt(p['js']['fps']):>8}   {extra}"
            )

if "--json" in sys.argv:
    out = {
        "results": {"/".join(k): v for k, (_, v) in results.items()},
        "events": {"/".join(k): v for k, v in events.items()},
    }
    json.dump(out, open(os.path.join(here, "summary.json"), "w"), indent=1)
    print("\nwrote summary.json")
