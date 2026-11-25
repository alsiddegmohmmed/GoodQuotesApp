# Expo Go SDK 58 — personal phone preview

The repository was originally built on SDK 53. The founder has Expo Go 58 installed on an iPhone. The migration helper resolves SDK 58 native package ranges from Expo's published npm package metadata, adds Worklets and explicitly declares the icon/font packages, removes unused legacy dependencies, and retains the existing local storage format using expo-file-system/legacy. It updates package.json, app.json, the two file-system imports and regenerates package-lock.json on the developer's Mac. It does not modify personal library data.

Run from the GoodQuotesApp checkout on codex/design-foundation with Node 22.13+:

```bash
node scripts/upgrade-expo58.mjs && npx expo start --go --tunnel --clear
```

Scan the QR with the iPhone camera. The local library, clipboard imports, text capture and browsing do not require the AI backend. AI and semantic discovery require the private gateway and credentials described in companion-setup.md. Expo Go is a development preview; native widgets and standalone distribution are outside this preview.

The helper is not a completed SDK upgrade: the authoring environment cannot reach the npm registry, so the dependency install, regenerated lockfile, typecheck, Metro bundle and device launch remain unverified. The current committed package manifest and lockfile remain on SDK 53 until a successful local migration. Do not force peer dependency resolution or commit a stale lockfile. If migration fails, inspect the error and current diff rather than overwriting existing local work. Verify with npx expo-doctor@latest, npm run test:library, npx tsc --noEmit and actual phone use before declaring compatibility.

Official references:
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/
- https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/

Recovery from an earlier ERESOLVE: stop Metro. Pull the updated migration helper and rerun it. It now resolves a clean lockfile in an isolated temporary directory before replacing the root lockfile and installing through npm ci, avoiding the installed SDK 53 tree. Only start Metro after the helper succeeds and confirms SDK 58. Existing app source edits outside the two file-system imports and app configuration are left untouched. The updated helper is not yet verified on the developer's Mac.
