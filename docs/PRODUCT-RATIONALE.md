# Little Atlas — October 2026 product iteration

## Origin and evidence
The designer described a personal problem: “The photos are still there, but I cannot remember the time and the story.” This is the origin of this Berkeley coursework project, not evidence of broad demand. No external participant interviews or usability findings are claimed.

## Working audience hypothesis
People who revisit places and keep personal travel photos, but lose the context around those moments. This is a proposed audience to recruit for validation, not a research-derived persona. The product is a private memory archive, not a social feed or a booking service.

## Core job and scope
When I return from a visit, I want to attach a date and a few words to a photo so I can later find that particular moment without remembering its filename. A place is a reusable container; a memory is a dated visit/story. Planning is secondary and stays separate from lived memories.

## Decisions in this iteration
- A photo-led memory archive exposes each dated visit directly. Place, date and note sit beside the image; the globe is a secondary spatial view.
- A timeline supports retrieval when a date is easier to recall than a location.
- Date + story accompany the image. Another visit at the same destination creates a memory, not another destination.
- Demo mode is labeled separately from the personal archive; demo edits are temporary.
- No automatic globe rotation by default. Motion explains state changes, not background decoration.
- Neutral paper-like surfaces, dark green primary actions, restrained borders and system sans typography. Repeated dashboard cards and decorative hero copy were removed. Ant Design informs hierarchy and interaction; this is not an Ant Design component implementation or a claim of certification.
- Visible keyboard focus, labeled fields, modal focus containment, Escape/return-to-trigger, reduced-motion support.

## Storage and commercial constraints
Current storage is per-browser localStorage/IndexedDB; there is no account sync or production backup guarantee. Browser clearing can remove memories. AI trip planning depends on a server-side API key and does not make bookings. A production release would require durable backup/export, deletion recovery, a clear data policy and monitored service failures. Do not call the current build a fully validated commercial product.

## Validation protocol — planned, not completed user research
Recruit 5–6 people who keep travel photos; include repeat visitors to a destination. Ask for their existing retrieval process before showing the prototype. Give the same tasks on old/new builds, alternate order, and record assistance rather than coaching:
1. Save a visit with date, photo and story.
2. Save a second visit to the same city; explain what will happen before confirming.
3. Find the first visit by place, then by date.
4. Edit its story and reload the page.
5. Explain where their data is saved and what demo mode does.
Record completion, wrong turns, assistance and participants' wording. Compare patterns, not inflated percentages from a tiny sample. Any later design claims must reference actual observations. Automated checks establish functionality only, not usability improvement or demand.

Sources: https://ant.design/docs/spec/introduce/ ; https://ant.design/docs/spec/motion/
