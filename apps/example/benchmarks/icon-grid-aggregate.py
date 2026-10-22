#!/usr/bin/env python3
"""Aggregates every run of the icon grid benchmark per (version, platform):
the memory added by N icons (PSS and GPU-tracked memory on Android from the
server's dumpsys captures, the process footprint on iOS from the screen's
probe), the UI thread statistics of the mount phase and the JS commit time,
averaged over the runs. Writes icon-grid-aggregate.json next to the results.

usage: icon-grid-aggregate.py [results dir]
"""
import glob
import json
import os
import sys
from statistics import mean

here = os.path.dirname(os.path.abspath(__file__))
results_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "results")

counts = [25, 50, 100, 200]


def stamp_of(name):
    # ...-<ISO stamp>.json; the stamp sorts chronologically.
    return name[-29:-5]


# Runs: every result file, in order.
runs = {}
for f in sorted(glob.glob(os.path.join(results_dir, "icon-grid-*.json"))):
    name = os.path.basename(f)
    if name.startswith("icon-grid-aggregate"):
        continue
    d = json.load(open(f))
    if "phases" not in d:
        continue
    runs.setdefault((d["version"], d["platform"]), []).append({"name": name, "stamp": stamp_of(name), "data": d})

# Android captures, assigned to the run whose result came right after them.
events = {}
for f in sorted(glob.glob(os.path.join(results_dir, "event-icon-grid-*.json"))):
    d = json.load(open(f))
    if not d.get("capture"):
        continue
    key = (d["version"], d["platform"])
    stamp = stamp_of(os.path.basename(f))
    run = next((r for r in runs.get(key, []) if r["stamp"] >= stamp), None)
    if run is None:
        continue
    events[(key, run["stamp"], d["phase"])] = d["capture"]


def kb_to_mb(v):
    return None if v is None else v / 1024


def memory(run, key, phase):
    """Memory at the end of the phase, MB: PSS and GPU (Android), footprint (both)."""
    out = {}
    cap = events.get((key, run["stamp"], phase))
    if cap and cap.get("meminfoEnd"):
        end = cap["meminfoEnd"]
        out["pss"] = kb_to_mb(end.get("totalPssKb"))
        out["gpu"] = kb_to_mb(end.get("glMtrackKb") or end.get("eglMtrackKb") or end.get("gfxDevKb"))
        out["graphics"] = kb_to_mb(end.get("graphicsKb"))
    p = next((p for p in run["data"]["phases"] if p["name"] == phase), None)
    if p and (p.get("extra") or {}).get("footprintMb") is not None:
        out["footprint"] = p["extra"]["footprintMb"]
    return out


def phase(run, name):
    return next((p for p in run["data"]["phases"] if p["name"] == name), None)


def avg(values):
    values = [v for v in values if v is not None]
    return round(mean(values), 2) if values else None


aggregate = {}
for key, key_runs in sorted(runs.items()):
    version, platform = key
    entry = {"version": version, "platform": platform, "runs": len(key_runs), "device": key_runs[0]["data"].get("device"), "counts": {}}
    base = [memory(r, key, "calibration") for r in key_runs]
    for n in counts:
        steady = [memory(r, key, f"steady-{n}") for r in key_runs]
        after = [memory(r, key, f"unmount-{n}") for r in key_runs]
        mounts = [phase(r, f"mount-{n}") for r in key_runs]
        unmounts = [phase(r, f"unmount-{n}") for r in key_runs]
        c = {}
        for metric in ("pss", "gpu", "graphics", "footprint"):
            added = [s.get(metric) - b.get(metric) for s, b in zip(steady, base) if s.get(metric) is not None and b.get(metric) is not None]
            left = [a.get(metric) - b.get(metric) for a, b in zip(after, base) if a.get(metric) is not None and b.get(metric) is not None]
            if added:
                c[f"{metric}AddedMb"] = avg(added)
                c[f"{metric}PerIconMb"] = round(avg(added) / n, 3)
                c[f"{metric}LeftMb"] = avg(left)
                c[f"{metric}SteadyMb"] = avg([s.get(metric) for s in steady])
        c["mount"] = {
            "uiFps": avg([m["ui"]["fps"] for m in mounts if m]),
            "uiP95Ms": avg([m["ui"]["p95Ms"] for m in mounts if m]),
            "uiMaxMs": avg([m["ui"]["maxMs"] for m in mounts if m]),
            "late": avg([m["ui"]["late"] for m in mounts if m]),
            "commitMs": avg([(m.get("extra") or {}).get("commitMs") for m in mounts if m]),
            "uiFpsRuns": [round(m["ui"]["fps"], 1) for m in mounts if m],
            "uiMaxMsRuns": [round(m["ui"]["maxMs"], 1) for m in mounts if m],
        }
        c["unmount"] = {
            "uiMaxMs": avg([u["ui"]["maxMs"] for u in unmounts if u]),
            "commitMs": avg([(u.get("extra") or {}).get("commitMs") for u in unmounts if u]),
        }
        entry["counts"][str(n)] = c
    entry["baseline"] = {metric: avg([b.get(metric) for b in base]) for metric in ("pss", "gpu", "graphics", "footprint")}
    cal = [phase(r, "calibration") for r in key_runs]
    entry["calibrationUiFps"] = avg([p["ui"]["fps"] for p in cal if p])
    aggregate["/".join(key)] = entry

out = os.path.join(results_dir, "icon-grid-aggregate.json")
json.dump(aggregate, open(out, "w"), indent=1)

for k, e in aggregate.items():
    print(f"\n== {k} ({e['runs']} runs) baseline {e['baseline']}")
    print(f"{'icons':>6}{'PSS +MB':>9}{'GPU +MB':>9}{'foot +MB':>10}{'per icon':>10}{'left MB':>9}{'mount fps':>11}{'max ms':>8}{'late':>6}{'commit':>8}")
    for n in counts:
        c = e["counts"][str(n)]
        per = c.get("gpuPerIconMb") if c.get("gpuPerIconMb") is not None else c.get("footprintPerIconMb")
        left = c.get("pssLeftMb") if c.get("pssLeftMb") is not None else c.get("footprintLeftMb")
        m = c["mount"]
        f = lambda v: "-" if v is None else f"{v:.1f}"
        print(f"{n:>6}{f(c.get('pssAddedMb')):>9}{f(c.get('gpuAddedMb')):>9}{f(c.get('footprintAddedMb')):>10}{f(per):>10}{f(left):>9}{f(m['uiFps']):>11}{f(m['uiMaxMs']):>8}{f(m['late']):>6}{f(m['commitMs']):>8}")
