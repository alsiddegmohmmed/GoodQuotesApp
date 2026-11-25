# Reading experience — UI preview

This is a first implementation of the written visual direction, not a completed or visually certified match to the approved mockup.

- Today: featured passage, in-progress books, recent highlights.
- Library: sample collection, status filters, title/author search, title sorting and grid/list mode.
- Book detail: sample progress, Highlights / Notes / About, copy-to-clipboard.
- Discover and Profile are explicitly unfinished; Profile retains access to the original quote feed.
- Sample data is separate from API code. Cover requests use Open Library; unavailable covers fall back to a typographic cover. No real personal library is imported.
- Capture actions, notes persistence, import, scanning, AI, discovery and real data integration are not implemented by this change.
- The existing API and backend are untouched.

The PNG reference was confirmed to exist in the branch, but its binary contents could not be retrieved in the remote authoring environment. Review the running UI alongside that image before accepting visual fidelity. No Expo runtime or typecheck was executed in that environment.

Run locally from the repository root:

```sh
npm ci
npx tsc --noEmit
npx expo start
```

Check on a phone: safe areas, text scaling, tab navigation, detail back navigation, copy, cover fallback, search, sorting and filters. Keep the approved direction as the source of truth; do not treat preview records as actual reader data.
