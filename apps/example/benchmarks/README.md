# Benchmarks

The example app's **🏁 Benchmarks** section (`src/Examples/Benchmarks`) holds
five scenarios that compare React Native Skia v2 and v3 on real devices. Each
screen runs its phases on its own, shows the statistics in an overlay and posts
them to the results server in this folder. The pages written up from the first
run (2026-10-17, Pixel 8 and iPhone 14 Pro) are the five artifacts linked from
the session that added them.

| Screen | What it shows |
| --- | --- |
| Heavy canvas | thousands of rects next to a React Native animation: the UI thread no longer draws in v3 |
| Many canvases | 20 to 200 sparkline canvases: many views stay main-thread bound |
| Android backing views | TextureView and SurfaceView frame pacing, read from SurfaceFlinger |
| Small icon | a spinner in a plain screen: repaint area and HWUI frame statistics |
| GC storm | 35 charts re-rendered per interaction: JS busy time and Hermes collections |

## Measuring

```sh
cd apps/example/benchmarks
node results-server.js            # port 4299; results/*.json, one file per run and per Android phase
```

`src/Examples/Benchmarks/config.ts` names the host the app posts to: Android
reaches the server on `localhost` through `adb reverse tcp:4299 tcp:4299`, an
iPhone needs the Mac's address on the network. The server can also queue
benchmarks: the app polls `/next` every two seconds while no benchmark is
running and opens the next one, which returns to the list when it is done.

- `run-android.sh <apk> [routes...]` installs the APK, pins the display to 120 Hz,
  opens the Benchmarks list by tapping through the home screen (uiautomator) and
  queues the benchmarks. Around every Android phase the server captures
  SurfaceFlinger's per-layer frame counts, HWUI's frame statistics and the CPU
  time of every thread of the process.
- `run-ios.sh <ReactTestApp.app> [routes...]` installs and launches the app on
  the iPhone (device id and bundle id at the top of the script) and queues the
  benchmarks.
- `summarize.py [--json]` prints one table per benchmark; `--json` writes
  `summary.json`.
- `dirty-regions.sh <tag>` re-runs the small icon benchmark with Android's
  "Show GPU view updates" overlay and screenshots the spinner phase.

## Release builds

The test app does not bundle JS in release builds, so `build-android-release.sh`
and `build-ios-release.sh` bundle it (`--dev false`), compile it to Hermes
bytecode with the `hermesc` of the installed hermes-engine pod, and build.
The iOS script also restores the signing settings that `pod install` drops and
adds `CADisableMinimumFrameDurationOnPhone` to the generated Info.plist so the
display link runs at 120 Hz on a ProMotion iPhone.

To measure v2, copy `src/Examples/Benchmarks` into the 2.x example (the import
becomes `@shopify/react-native-skia`, `BENCH_VERSION` becomes `"v2"`), register
the section in `App.tsx`, `types.ts`, `Home/HomeScreen.tsx` and
`Examples/index.ts` the same way, and build it with the same scripts.
