# GoodQuotes / Mnemos — Product experience and feature specification

Status: Product direction and feature vision consolidated from the founder discussions of 25 November 2026. GoodQuotes is the working name; Mnemos is a secondary candidate, not a rename. This is not a claim that features are implemented. Exact integration methods and unvalidated personalization mechanisms remain design decisions.

## 1. Purpose and non-negotiable identity

A second memory for a curious mind. A private intellectual companion that helps a reader encounter their own reading life as a living conversation across books, ideas, questions and time. Goodreads records what was read; GoodQuotes aims to help readers discover what reading does to them. The desired feeling is like talking to oneself with access to the ideas one has encountered, not talking to a generic chatbot or a simulated copy of oneself.

Deep personalization is the purpose, not a feature added to a tracker. Import, capture, rediscovery, cross-book connection and conversation are foundational and must all appear in the first usable version in proportionate form. The library provides the evidence; the relationship between reader and ideas provides the value. Reading progress and statistics are supporting utilities, not the product's center.

The three research reports underpin this direction: Reader Behavior Across Goodreads, Readwise, StoryGraph, Annotate, Bookshelf, and Embertale; Deeply Personalized Reading Experiences; and The Philosophy and Psychology of Reading. They support plausible needs around remembering, curiosity, autonomy, continuity and discovery, but do not establish that a lifelong intellectual biography or AI-generated connections reliably improve readers' lives. Treat these as hypotheses to test, not scientific promises.

## 2. Personalization contract (applies to every feature)

- Preserve source evidence (author, exact passage, edition/location when known), reader evidence (actual highlight, note, question, explicit preference, date) and system inference separately. A highlight is attention, not agreement or proof of learning. A finished book is exposure, not proof of beliefs.
- Use the reader's own saved passages, reflections, reading history, explicit interests and voluntarily supplied present context. Never invent a passage, a personal memory, a date or a belief. Distinguish external book knowledge from personal evidence. Sparse evidence must produce modest claims.
- Connect ideas by meaningful relationships: agreement, contrast, qualification, different levels of an argument, recurring questions, analogy, or evolution of a documented interpretation. Similarity alone is not sufficient.
- Retain original notes and historical versions where the reader wants them; allow correction, rejection, removal and exclusion from personalization. Do not silently rewrite history or freeze a reader into a past identity.
- Personalization should support intellectual breadth, including unfamiliar disciplines and opposing views, without forcing them. Do not infer diagnoses, private life circumstances or sensitive identity from reading traces.
- Make important claims inspectable through links to source passages and dates. The reader remains the final interpreter. Avoid false intimacy, sycophancy, obligatory reflection and unsolicited psychoanalysis.
- Make capture fast and keep reminders optional, configurable and quiet. The reader can enjoy a passage and leave. No mandatory tags, quizzes, streaks, public feed or engagement pressure.
- Privacy by default, per-reader isolation, meaningful control of AI use, notification privacy, and complete export of personal material. Respect source rights and do not obtain protected book content without authorization.

## 3. Feature catalog

### F01 — Personal Library
Human need: ownership, continuity, effortless access. Cover-led library with read/reading/saved status, search, collections, optional progress, dates and ratings. Each book includes personal highlights, bookmarks, notes, rereads and history. Import Goodreads library metadata and reviews when available; preserve supplied dates rather than inventing them. Merge duplicate editions cautiously, keeping source attribution and reader records. Supports print, ebook and audio. Book counts and statistics are optional, secondary. A reader can add a book without completing a questionnaire. A book without highlights is not evidence of a particular interpretation.

### F02 — Intelligent Highlights and Capture
Human need: preserve the thought without breaking reading flow. Capture by typing/pasting, photographing and OCR of physical pages, and voice notes; import existing Kindle, Readwise and supported EPUB annotations/quote collections. Preserve exact original text, source, page/chapter/location, date and reader note when supplied. Let the reader correct OCR and book matching before saving; distinguish unknown metadata from fabricated metadata. Repeated imports must avoid duplicate records without destroying intentionally separate annotations. Search, favorites, bookmarks, editing, deletion, sharing and export are supported. Notes are optional, freeform and not auto-rewritten. Import should deliver usable personal material immediately, not merely create a shelf. File-based import is a valid initial method; direct sync feasibility is not yet established.

### F03 — Rediscover / Intellectual Memory
Human need: recover forgotten meaningful ideas and enjoy old passages. A daily selection of saved passages and reflections, with configurable mobile notifications and widgets. Sometimes present a single beautiful quotation without analysis; sometimes bring back a forgotten idea; sometimes connect a past passage to current reading or a recurring question. Use elapsed time, repetition avoidance, user-marked importance, recent reading and explicit interests as candidate signals. Offer save/favorite, dismiss, less like this, pause, and access to the original source. Search by exact words or meaning even if the reader forgets the author. Optional active recall and spaced review only when requested for retention; no requirement to complete a daily session. Never present generated text as an exact quotation. Private lock-screen display must be controllable.

### F04 — Intellectual Threads and Cross-book Connections
Human need: see meaningful relationships one might otherwise miss. Automatically suggest links between actual passages, notes, questions and books, as well as allow reader-created links. Organize some exploration around persistent questions instead of only genres. Show the specific evidence for a connection, its relationship type and concise explanation; allow opening the source, saving, correcting, rejecting or discussing it. Distinguish author-to-author connections from personal historical claims. Prefer one illuminating connection to many obvious ones. A current highlight may reconnect with a past question, a conflicting argument or a later reflection. Do not force a graph, taxonomy or note maintenance workflow.

Illustrative case (book-theme interpretation, not fabricated user highlights): Deep Work addresses how to direct attention; The Defining Decade asks which commitments build a future; Tuesdays with Morrie asks what ultimately deserves that commitment. Together they raise whether effective work is serving a meaningful life. If a reader actually wrote an earlier question about ambition, the system could cite and bring it back. A different reader of the same books may receive a connection about relationships rather than career. An agent must not reduce this to three similar productivity books. This is the signature experience from the first usable build.

### F05 — Reading Companion
Human need: intellectual companionship, retrieval and dialogue. Text and voice conversation about passages, books, questions and the personal library, with continuity across conversations where the reader permits it. Find prior ideas, compare authors, discuss interpretations, answer direct questions, offer counterarguments, and pick up unresolved questions naturally. Avoid spoilers based on explicit reading location or consent; if location is unknown, ask or stay spoiler-safe. Cite actual saved material for personal claims, distinguish paraphrase from quotation, and acknowledge insufficient evidence. Let the reader save a thought from conversation, not require it. Do not make every response a quiz or agree automatically. The companion should make the reader's own thinking more accessible, not claim to know their entire mind.

### F06 — Personalized Discovery
Human need: find a worthwhile next book, expand curiosity and enjoy serendipity. Recommendations use explicit taste, reading history, saved questions, current intentions, available time and optionally stated mood. Support familiar pleasures, unfamiliar subjects and contrasting perspectives; explain why a recommendation is relevant without claiming certainty about preferences. Connect recommendations to specific questions or prior books when useful. Avoid endless same-genre suggestions and generic productivity lists. Let readers dismiss and steer recommendations. A novel chosen for pleasure requires no intellectual justification.

### F07 — Intellectual Biography
Human need: continuity between earlier and current selves. Dated reading history, original notes, questions and rereads, with timeline views and optional annual retrospective focused on ideas rather than counts. Revisit earlier words and compare them with later words; preserve disagreements and superseded views. Offer private personal anthologies by theme. Do not claim a book changed a person's beliefs without their own evidence. Long-term value is an unvalidated hypothesis; a beautiful timeline does not prove benefit.

### F08 — Reading Rituals
Human need: reconnect with the pleasure of reading. Optional morning passages, evening rediscovery, configurable reminders, home/lock-screen widgets where supported and gentle reading-slump assistance. Let the reader choose cadence, quiet hours and pause. No shame, mandatory streaks, debt of missed reviews, or attempts to maximize time in app. Reading reminders and quotation reminders are different controls; a reader can use one without the other. Sometimes the best support is no intervention.

### F09 — Intellectual Universe
Human need: navigate one's intellectual exploration. An optional interactive map of books, authors, ideas, questions and disciplines, with navigable evidence and clearly labeled suggested links. Explore subjects and adjacent perspectives; permit manual correction and filtering. Do not assign intelligence, expertise, moral or psychological scores based on book counts or generated labels. Map complexity should not be necessary to experience connections. Validate usefulness before investing heavily in visualization.

### F10 — Shared Reading
Human need: chosen companionship with other readers. Optional private buddy reading and book discussions, sharing selected passages or notes by explicit choice; spoiler-aware when progress is available. Private by default, no automatic exposure of highlights or AI conversations, no public feed or competitive leaderboard. This is part of the broader feature vision, not a dependency of the personal first build.

## 4. Product experience and navigation

Mobile-first, complementary web for bulk organization and deeper exploration; one private library. Preserve the approved dark, content-led Apple/Spotify/Letterboxd-inspired visual direction in design-direction.md. Covers and literary typography provide personality. Today should foreground rediscovery and connections, not metrics; Library holds books and capture; book detail exposes personal material and related ideas; discovery provides exploration; conversation should be accessible from a passage and the wider library. Exact navigation beyond approved mockup is not locked. No UI should imply that sample records are the reader's history.

## 5. Quality bar and validation

The user must be able to import real data, preserve a new passage, receive a useful reminder, encounter a grounded cross-book connection, and discuss it on a phone. Test whether the reader recognizes the evidence, finds the connection surprising and useful, can correct it, and wants to return without pressure. Track failures (wrong sources, fabricated memories, obvious links, missed reminders, duplicate imports, privacy exposure, burdensome capture). Do not optimize notification opens or time in app as the primary measure. The stronger long-term claims remain unproven. The first personal deployment is an experiment in real use, not evidence of market demand.

See first-mobile-build.md for initial scope. This specification preserves the full ten-feature vision; simplifying the first implementation does not delete future capabilities.
