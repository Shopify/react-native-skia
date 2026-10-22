#!/usr/bin/env python3
"""Prints the icon grid benchmark as one table per (version, platform): the UI
thread statistics of every phase, the JS commit time of the mount and unmount
phases, and the process memory the results server read around each phase on
Android (dumpsys meminfo). On iOS the memory comes from an Instruments
recording cut into phases by the event timestamps the server saved (see
ios-memory.py), merged in here when its JSON is present.

usage: icon-grid-summary.py [--json out.json]
"""
import glob
import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
results_dir = os.path.join(here, "results")

results = {}
for f in sorted(glob.glob(os.path.join(results_dir, "icon-grid-*.json"))):
    d = json.load(open(f))
    if "phases" in d:
        results[(d["version"], d["platform"])] = (os.path.basename(f), d)

captures = {}
for f in sorted(glob.glob(os.path.join(results_dir, "event-icon-grid-*.json"))):
    d = json.load(open(f))
    if d.get("capture"):
        captures[(d["version"], d["platform"], d["phase"])] = d["capture"]

ios_memory = {}
for f in sorted(glob.glob(os.path.join(results_dir, "ios-memory-*.json"))):
    d = json.load(open(f))
    for phase, mem in d.get("phases", {}).items():
        ios_memory[(d["version"], "ios", phase)] = mem


def mb(kb):
    return None if kb is None else kb / 1024


def fmt(v, digits=1):
    if v is None:
        return "-"
    if isinstance(v, float):
        return f"{v:.{digits}f}"
    return str(v)


def memory_of(version, platform, phase):
    """Process memory at the end of the phase, in MB: PSS and the GPU-tracked
    allocations on Android, the physical footprint on iOS."""
    if platform == "android":
        cap = captures.get((version, platform, phase))
        end = cap.get("meminfoEnd") if cap else None
        if not end:
            return {}
        return {
            "pss": mb(end.get("totalPssKb")),
            "graphics": mb(end.get("graphicsKb")),
            "gpu": mb(end.get("glMtrackKb") or end.get("eglMtrackKb") or end.get("gfxDevKb")),
            "native": mb(end.get("nativeHeapKb")),
        }
    mem = ios_memory.get((version, platform, phase))
    return {"footprint": mem.get("footprintMb")} if mem else {}


def footprint_of(p):
    """The footprint the screen read at the end of the phase (see IconGrid)."""
    return (p.get("extra") or {}).get("footprintMb")


rows = {}
for (version, platform), (name, d) in sorted(results.items()):
    print(f"\n== icon-grid · {version} / {platform}  ({name})")
    if platform == "android":
        header = f"{'phase':<14}{'UI fps':>8}{'p95 ms':>8}{'max ms':>8}{'late':>6}{'commit ms':>11}{'PSS MB':>9}{'gfx MB':>8}{'GPU MB':>8}{'RSS MB':>9}"
    else:
        header = f"{'phase':<14}{'UI fps':>8}{'p95 ms':>8}{'max ms':>8}{'late':>6}{'commit ms':>11}{'footprint MB':>14}"
    print(header)
    for p in d["phases"]:
        extra = p.get("extra") or {}
        mem = memory_of(version, platform, p["name"])
        if mem.get("footprint") is None and footprint_of(p) is not None:
            mem["footprint"] = footprint_of(p)
        ui = p["ui"]
        line = (
            f"{p['name']:<14}{fmt(ui['fps']):>8}{fmt(ui['p95Ms']):>8}{fmt(ui['maxMs']):>8}"
            f"{ui['late']:>6}{fmt(extra.get('commitMs')):>11}"
        )
        if platform == "android":
            line += f"{fmt(mem.get('pss')):>9}{fmt(mem.get('graphics')):>8}{fmt(mem.get('gpu')):>8}{fmt(mem.get('footprint')):>9}"
        else:
            line += f"{fmt(mem.get('footprint')):>14}"
        print(line)
        rows[f"{version}/{platform}/{p['name']}"] = {
            "version": version,
            "platform": platform,
            "phase": p["name"],
            "params": p.get("params"),
            "ui": ui,
            "js": p.get("js"),
            "commitMs": extra.get("commitMs"),
            "memory": mem,
        }

if "--json" in sys.argv:
    out = sys.argv[sys.argv.index("--json") + 1]
    json.dump(rows, open(out, "w"), indent=1)
    print(f"\nwrote {out}")
