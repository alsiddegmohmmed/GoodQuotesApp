# Reading app — approved visual direction v1

Approved November 25, 2026. Mobile-first, for GoodQuotesApp (React Native / Expo). The approved reference is a three-screen dark-mode mockup: Today, Library, and A Little Life book detail.

## Visual identity

- Neutral near-black and charcoal surfaces; white and cool gray interface text.
- Apple-like precision, Spotify-like content hierarchy, Letterboxd-like collection browsing. These are qualities, not instructions to copy branded interfaces.
- Book covers provide the primary color and atmosphere. Optional book-specific color on detail headers and highlights. No global gold, metallic, electric-blue, or ornamental luxury styling.
- System sans-serif for interface labels; readable serif for featured literary passages.
- Minimal chrome, three-column cover grid, understated cards, clear spacing, compact persistent navigation.
- Theme tokens: `src/theme/tokens.ts`. Values are implementation starting points rather than pixel-sampled mandatory colors. Warm neutral accent is optional and local to content, not a brand accent.

## Screen direction

- Today: featured passage, continue reading, recent highlights.
- Library: All / Reading / Finished / Saved, sorting and grid/list browsing.
- Book detail: book-cover-led header, status and reading progress, Highlights / Notes / About tabs, add highlight and scan page.
- Profile: saved passages, reading statistics and preferences; not shown in the approved mockup.

## Implementation sequence

1. Theme and navigation shell.
2. Today screen.
3. Library.
4. Book detail.
5. Connect real data; keep existing backend intact during UI prototyping.

Organize reusable components by layout, navigation, cards, books and quotes; keep screens, navigation, theme and mock data separate. Do not imply that playback, scanning or persistence is implemented until those actions are wired. Respect safe areas, text scaling, contrast and accessible tap targets.

## Reference asset

Target: `assets/design/reading-app-direction-v1.jpg`. The original approved mockup is the visual source of truth, not sample reading progress, quote page numbers or cover artwork. Asset upload must be verified before treating this path as present.
