# GoodQuotes — Product definition

*A second memory for a curious mind.*

## What the product is

GoodQuotes is a mobile-first, personalized reading companion. It brings together the books a person reads, the passages they highlight, the places they bookmark, the notes they write, and the ideas they discover.

Its purpose is to make reading a lasting part of someone's intellectual life. A book should not disappear from a reader's attention when they finish it. The ideas that mattered should remain accessible, relevant, and connected to everything they read afterward.

GoodQuotes is not simply a quote collection, a reading tracker, or an AI book-summary app. It is a living personal library that helps readers remember, reflect, and discover.

GoodQuotes is the working name inherited from the existing projects; Mnemos is retained as a secondary possible name. Final branding has not been decided.

## Why it exists

Readers often finish a book with the feeling that it has changed something in them. Months later, they remember that feeling but struggle to recall the passage, the argument, or even the book it came from.

Highlights become scattered across e-readers, physical books, notes, screenshots, and bookmarks. Reading trackers record completed books but do not necessarily help readers reconnect with their ideas. A saved quote is useful only if the reader can find it again or encounter it at a meaningful moment.

GoodQuotes brings those fragments together in one personal reading memory. Its value grows with the reader's collection and history.

## Who it is for

The product is for curious readers who care about what they retain, not only how much they read. It accommodates fiction and nonfiction, physical and digital books, occasional readers and people pursuing a broad intellectual education.

The same experience can support someone revisiting a moving passage from a novel, someone studying philosophy, or someone exploring an unfamiliar subject through a series of books.

## The reading experience

### Personal library

The library is the reader's own collection, organized around book covers rather than a dense spreadsheet of records. Readers can browse books they are reading, have finished, or have saved for later.

A book is more than its title and author: it contains the reader's progress, bookmarks, highlights, notes, and personal history with that work. The library accommodates books read outside GoodQuotes. The product does not depend on becoming the reader's only e-book application.

Goodreads library imports, Kindle highlights, supported EPUB annotations, and existing quote collections are part of the discussed product vision. Exact integration support is not yet decided.

### Highlights, bookmarks, and notes

Highlights are the passages a reader wants to preserve. Bookmarks record locations they want to return to, independently of whether they saved a passage. Notes record their own thoughts and interpretations.

Readers can capture passages manually or photograph a physical book page and extract its text. A saved passage retains its source and, where available, page or chapter information. Readers can revisit, organize, search, and share selected passages.

The product keeps the author's words distinct from the reader's reflections and AI-generated interpretations. A highlight should remain useful long after the moment it was captured.

### Intellectual memory

GoodQuotes brings old reading back into the present. It resurfaces meaningful passages rather than leaving them buried in a collection.

The daily experience can include a featured idea, a forgotten highlight, or an idea related to a book the reader is currently reading. Over time, resurfacing can adapt to the reader's interests, the importance they assign to passages, elapsed time, and recall.

Active recall and reflection questions help readers engage with an idea rather than repeatedly skim the same quotation. Semantic search helps them retrieve a passage when they remember its meaning but not its exact words.

### Reading companion

The reading companion understands the reader's library, highlights, notes, and interests. It provides a space to discuss what they read, explore questions, clarify arguments, and challenge interpretations.

Its responses should be grounded in the reader's actual saved material when referring to their reading history. It distinguishes what the author said from what the reader wrote and what AI infers. Discussions about a book respect the reader's progress and avoid unwanted spoilers.

AI supports the experience without dominating it. GoodQuotes should still feel like a reading application, not a chatbot with a bookshelf attached.

### Connections between books

Ideas do not belong to individual books alone. GoodQuotes helps readers discover recurring themes, complementary arguments, disagreements, and unexpected relationships across their collection.

For example, a reader might encounter different perspectives on ambition in a productivity book, a philosophical text, and a novel. The companion can bring relevant passages together and invite the reader to examine how the perspectives differ.

Connections should point back to the books and passages that support them. They are suggestions for exploration, not definitive judgments about what a reader believes.

### Personalized discovery

Recommendations consider what the reader has enjoyed, what they highlight, subjects they want to understand, and the questions they are exploring. They can also account for available reading time and preferences.

Personalization should expand the reader's intellectual world rather than narrow it. Someone who reads extensively about productivity might discover behavioral economics, neuroscience, or philosophy instead of receiving an endless list of similar productivity books.

The broader vision includes exploring fields such as history, psychology, literature, science, economics, philosophy, and religion. A personal knowledge map can make the relationships between these subjects visible without pretending that book counts measure expertise.

### Intellectual biography

Over years, a library becomes a record of a person's changing interests and thinking. GoodQuotes preserves dated highlights, reading history, questions, and reflections so the reader can return to earlier periods of their intellectual life.

A reader can revisit what mattered to them years ago, compare earlier interpretations with current ones, and create personal anthologies around themes that have followed them through different books.

The goal is not to quantify intelligence. It is to preserve a meaningful history of reading and thought.

## The application

GoodQuotes is mobile-first, with a complementary web experience envisioned for deeper exploration and library organization. Both experiences belong to the same personal library.

The mobile experience is the natural place to capture a passage with a camera, record a bookmark, revisit a highlight before bed, or retrieve an idea during a conversation. Offline access, notifications, and widgets are part of the discussed mobile experience.

The web experience is intended for larger collections, bulk imports, longer reflections, and exploring connections across books.

### Today

A personal reading home featuring a daily idea, books in progress, and recent highlights. It gives the reader a reason to return without demanding a reading streak or another task.

### Library

A cover-led collection with All, Reading, Finished, and Saved filters. Search, sorting, and browsing help readers find a book and return to its personal record.

### Book detail

A book-cover-led page with title, author, reading status, and progress. Highlights, Notes, and About provide the main content sections in the approved mockup. Bookmarks also belong to the book's personal record. Add Highlight and Scan Page provide direct capture actions.

### Discovery and profile

Discovery is the space for recommendations, related ideas, and intellectual exploration. The profile holds personal reading history, saved passages, preferences, and reading statistics. Their exact screen designs have not been approved; the approved mockup depicts Today, Library, and Book Detail.

## Visual identity

The approved design is a dark, content-led mobile experience. It takes inspiration from Apple's interface precision, Spotify's hierarchy, and Letterboxd's collection-first character, without copying their branding or interfaces.

The interface uses neutral near-black and charcoal surfaces, crisp white and cool-gray text, understated cards, restrained controls, and generous but purposeful spacing. System sans-serif typography supports navigation and labels; literary serif typography gives selected passages a distinct voice.

Book covers provide most of the color. Book-specific accents and atmospheric artwork may support the reading experience. A global gold, metallic, or electric-blue palette is not part of the approved direction.

The three-screen reference is stored in [assets/design](../assets/design). [Design direction](design-direction.md) and [theme tokens](../src/theme/tokens.ts) record the visual foundation.

## Product character and trust

GoodQuotes should be calm, personal, and pleasant to return to. It is not designed around public social feeds, competitive leaderboards, aggressive streaks, advertisements, or compulsory gamification.

Reading memories belong to the reader. The product should preserve them, keep them private by default, and support complete data export. Personalization should serve the reader rather than manipulate their attention.

## Product identity in one sentence

GoodQuotes is a personal reading companion that remembers the books, passages, and ideas that shaped you, and helps you reconnect with them throughout your life.

---

This document describes the product concept discussed to date. The mobile-first direction and three-screen visual reference are approved; detailed future capabilities describe the shared product vision, not claims about shipped functionality or finalized specifications. It contains no release schedule, engineering plan, pricing decision, or implementation commitments.


See [full product feature specification](product-features.md) for the detailed experience contract and [first usable mobile build](first-mobile-build.md) for the separate initial scope.
