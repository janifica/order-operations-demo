# Parcel portfolio video

From the repository root, install with `npm ci --prefix media`, then run `npm run video`.

The pipeline replays the actual domain Engine and renders the current application UI. Captured real ClickUp/Slack evidence remains separately dated. No external actions are sent while rendering. Outputs live in ignored `workspace/video/`.

Edit `src/timeline.ts` for captions, timing and scene order; edit `scripts/replay.ts` for the synthetic scenario. Full instructions and evidence boundaries: [video pipeline](../doc/video-pipeline.md).

After `npm run video:check` generates inputs, `npm run dev --prefix media` opens Remotion Studio. All dependency versions are pinned in the media lockfile. Rendering uses isolated Chrome for Testing, not the user's authenticated browser.
