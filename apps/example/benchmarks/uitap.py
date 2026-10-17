#!/usr/bin/env python3
"""Taps a node of the Android UI by its text, via uiautomator.

usage: uitap.py <text substring> [--scroll-down N] [--dump]
"""
import re
import subprocess
import sys
import time


def sh(*args):
    return subprocess.run(["adb", "shell", *args], capture_output=True, text=True).stdout


def dump():
    sh("uiautomator", "dump", "/sdcard/ui.xml")
    return sh("cat", "/sdcard/ui.xml")


def nodes(xml):
    out = []
    for node in xml.split("<node")[1:]:
        text = re.search(r'text="([^"]*)"', node)
        desc = re.search(r'content-desc="([^"]*)"', node)
        bounds = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', node)
        if not bounds:
            continue
        x1, y1, x2, y2 = map(int, bounds.groups())
        out.append(((text.group(1) if text else "") + "|" + (desc.group(1) if desc else ""), (x1 + x2) // 2, (y1 + y2) // 2))
    return out


def main():
    args = sys.argv[1:]
    if "--dump" in args:
        for t, x, y in nodes(dump()):
            if t.strip("|"):
                print(f"{x},{y}\t{t}")
        return
    scroll = 0
    if "--scroll-down" in args:
        i = args.index("--scroll-down")
        scroll = int(args[i + 1])
        del args[i : i + 2]
    target = args[0]
    for _ in range(scroll):
        sh("input", "swipe", "540", "1800", "540", "600", "300")
        time.sleep(0.6)
    for attempt in range(6):
        for t, x, y in nodes(dump()):
            if target.lower() in t.lower():
                sh("input", "tap", str(x), str(y))
                print(f"tapped '{t}' at {x},{y}")
                return
        sh("input", "swipe", "540", "1800", "540", "600", "300")
        time.sleep(0.8)
    print(f"not found: {target}")
    sys.exit(1)


if __name__ == "__main__":
    main()
