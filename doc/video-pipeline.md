# Repeatable portfolio video pipeline

Run from the application repository:

```sh
npm ci
npm ci --prefix media
npm run video
```

Outputs are ignored under `workspace/video/`: `parcel-portfolio.mp4`, `preview.png`, `captions.srt`, and `manifest.json`. The composition is 1920×1080, 30 fps, 120 seconds, H.264. No external SaaS account or credential is required for regeneration. `npm run video:check` regenerates inputs and runs TypeScript checks without encoding the video. The first render downloads isolated Chrome for Testing; later runs reuse it. This macOS environment's default Headless Shell failed ICU initialization, so the checked-in config selects Chrome for Testing.

## Inputs and stages

1. `media/scripts/replay.ts` runs the actual domain Engine in an in-memory SQLite database with a fixed clock. It imports a synthetic two-package order, processes partial/full delivery, rejects duplicate/stale events and checks the provider action count remains unchanged. UUIDs are normalized for comparable generated input files.
2. `media/scripts/pipeline.mjs` copies approved dated provider evidence and generates a copy of the current app CSS without remote font imports. Video text uses Arial; the interactive application keeps its original fonts.
3. `media/src/timeline.ts` owns scene order, captions and durations. `Scene.tsx` renders the current `client/App.tsx` with read-only presentation props. Presentation mode disables polling and native modal effects; it opens static dialogs and labels the state as offline replay. The public app's default behavior is unchanged.
4. Remotion renders a preview and the MP4. The manifest records source/evidence SHA-256 hashes, rendering parameters, timestamp and output hash. Any failed replay, type check or render stops the command.

Edit app UI or business rules in their original source files and run the same command. Edit captions/timing in `timeline.ts`. Edit the repeatable synthetic scenario in `replay.ts`. Do not maintain a separate replica of the app interface in the video project.

## Connected evidence boundary

ClickUp and Slack scenes use actual sanitized screenshots captured on 2026-10-08 in Asia/Shanghai for PORTFOLIO-2001. They are labeled as dated connected evidence, not newly executed actions. Other app scenes are explicitly offline simulation. The renderer neither logs into SaaS accounts nor sends provider messages. To demonstrate a changed real integration, conduct a separate authorized connected acceptance run, replace its approved evidence and update capture dates/captions.

This is an annotated generated walkthrough, not a continuous live screen recording. Tracking events and customer data remain synthetic. Real carrier tracking and client impact metrics are not claimed. Video dependencies are excluded from the runtime Docker context.
