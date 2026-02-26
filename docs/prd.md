# PRD: Förskoleguiden

## 1. Product overview

### 1.1 Document title and version

- PRD: Förskoleguiden
- Version: 0.1 (2026-02-25)

### 1.2 Product summary

Förskoleguiden is a static, accessible website that makes it easy for parents in Sweden to compare preschools using official survey ratings published by local government.

The initial launch focuses on Malmö and the latest available survey year (2025). The year is visible but not changeable in the MVP.

Swedish is always the default language on first visit, with multilingual support (Swedish, English, Arabic). The experience is mobile-first (targeting iPhone 13 mini size) and emphasizes side-by-side comparison across multiple preschools.

For the MVP, the site only displays and compares the question group “Helhetsbedömning” (as in the JSON template). Later versions expand to include all question groups from the official reports.

The site also supports a key real-world workflow: parents can select up to five preschools (as required by the municipality application process), save/share that list via a URL that encodes state (no backend), and optionally email the list to themselves using their email client.

## 2. Goals

### 2.1 Business goals

- Reduce friction and time-to-decision for parents comparing preschools.
- Build trust by clearly attributing data to the local government and by presenting it transparently.
- Enable a low-ops, portable deployment model (static CDN) with minimal external dependencies.
- Provide a foundation for expanding to additional cities and survey years.

### 2.2 User goals

- Quickly compare multiple preschools side-by-side across the same questions and categories.
- Understand strengths/weaknesses with accessible charts and readable summaries.
- Build and share a shortlist of up to five preschools with a partner.
- Filter and narrow options based on practical criteria (distance, operator type, profiles) without losing sight of quality.
- Use the site comfortably with assistive technology, keyboard-only navigation, and in multiple languages.

### 2.3 Non-goals

Non-goals are explicitly out of scope for the MVP (and will not be pursued unless they are later promoted into scope).

- Providing real-time queue status, admissions decisions, or application submission.
- Replacing municipality application flows.
- Hosting user accounts, storing user profiles, or collecting personal data.
- Parsing PDFs in the browser.
- Providing turn-by-turn routing or map tiles that require external map APIs.
- Allowing users to change the survey year in the UI (MVP).
- Usage tracking/analytics in the MVP.
- Building a PDF-to-JSON conversion pipeline (planned post-MVP).

## 3. User personas

### 3.1 Key user types

- Parents/guardians choosing preschools in Malmö.
- Co-parents/partners collaborating on the shortlist.
- Curious residents (read-only browsing).
- Data maintainers (project contributors) who add/update preschool JSON files.

### 3.2 Basic persona details

- **First-time parent (Malmö)**: Limited time, high uncertainty, wants guidance and trustworthy information.
- **Experienced parent (Malmö)**: Knows what matters (location, pedagogy) and wants fast comparisons and a shareable shortlist.
- **Co-parent collaborator**: Needs an easy way to review and discuss the same set of schools without creating accounts.

### 3.3 Role-based access

- **Anonymous visitor**: Full read access to browse, compare, and generate shareable URLs; no login.
- **Link recipient**: Opens a shared URL that restores the compare set and “pick 5” shortlist.
- **Maintainer (out of product scope runtime)**: Updates static JSON data and site content via the repository and build pipeline.

## 4. Functional requirements

- **City selection** (Priority: P0)
  - The UI supports selecting a city; at launch Malmö is the only available/selectable city.
  - Malmö is selected by default on first visit.
  - The city selector includes visible but disabled placeholders for Stockholm and Göteborg to hint at future expansion (for example labeled “coming soon”).
  - The architecture and data model support adding additional cities without changing the core UX.

- **Survey year (MVP locked)** (Priority: P0)
  - The site defaults to the latest available survey year for Malmö (2025).
  - The year is visible in the UI but is not selectable/changeable in the MVP.
  - The architecture supports adding additional years later.

- **Preschool directory** (Priority: P0)
  - Show a list of preschools available for the selected city (Malmö) and the locked survey year (2025).
  - Each preschool has a details page/section with address, operator type (municipal/independent), and survey summary.

- **Ranked list (directory sorting)** (Priority: P0)
  - The directory provides a ranked/sortable list to help users discover candidates to compare.
  - In the MVP, provide at minimum:
    - A default ranking based on “Helhetsbedömning” (for example, the combined agree share across its questions).
    - A secondary sort option (for example alphabetical).
  - The ranking method must be transparent in the UI (what it is and how it is computed).

- **Side-by-side comparison** (Priority: P0)
  - Users can select multiple preschools and compare them in a single view.
  - In the MVP, comparison includes the question group “Helhetsbedömning” only.
  - Later versions can extend comparison to all question groups present in the source reports/JSON.
  - Comparison works well for 2–5 preschools (target), with a defined behavior for 1 and for >5 selections.

- **Compare tray (persistent selection)** (Priority: P0)
  - A persistent compare tray shows the currently selected preschools.
  - Users can add/remove preschools to a comparison set from the directory and from preschool pages.
  - The tray provides a clear call-to-action to open the side-by-side comparison.

- **Visualizations and text summaries** (Priority: P0)
  - Render accessible charts (with equivalent table/text alternatives) for rating distributions.
  - Provide plain-language comparison summaries using deterministic (non-AI) logic and prewritten templates.
  - The MVP summary logic must be simple, explainable, and consistent, for example:
    - Compute an “agree share” per question as $completelyAgree + partlyAgree$.
    - Compare preschools by agree-share deltas with a fixed threshold (for example $\ge 5$ percentage points = “higher”, $\le -5$ = “lower”, otherwise “similar”).
    - Use neutral template phrases per outcome (higher/lower/similar) and avoid subjective wording.
  - In the MVP, summaries cover “Helhetsbedömning” only.

- **Pick five shortlist** (Priority: P0)
  - Users can add preschools to a shortlist of up to five.
  - The shortlist is visible, editable, and can be reviewed alongside comparison results.

- **Shareable URL with full state** (Priority: P0)
  - Users can share a URL that restores selected city/year, comparison set, and shortlist.
  - The URL encoding must be resilient and forward-compatible (versioned payload).

- **Email the shortlist** (Priority: P1)
  - Provide an “email to self/partner” action using `mailto:` with a prefilled subject/body.
  - The email content includes preschool names, addresses, and a share link.

- **Filtering by practical criteria** (Priority: P1)
  - Users can narrow the directory and/or comparison candidates by:
    - Operator type (municipal vs independent)
    - Profiles/tags (for example Montessori, outdoor)
    - Distance (if coordinates are provided; see technical considerations)
  - Filtering must be accessible and must not rely on external APIs.
  - If geolocation is used for distance, permission prompts must only appear after an explicit, informed user action (for example clicking “Use my location”).

- **Step-by-step guide to pick five** (Priority: P1)
  - Provide a simple guided flow that asks about priorities (for example distance vs ratings vs operator type vs profiles) and suggests a shortlist.
  - The guide must be transparent about how suggestions are computed.

- **Independent preschool queue link** (Priority: P0)
  - For independent preschools, show a clear link to the preschool’s official instructions/homepage for registering in their private queue.

- **Data attribution and provenance** (Priority: P0)
  - The site must clearly acknowledge that survey data is provided by the local government (for Malmö, Malmö stad) and link to the official overview/source pages.
  - For Malmö, link to: <https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten.html>
  - The MVP does not need to link to each individual preschool PDF.

- **Accessibility and multilingual support** (Priority: P0)
  - The entire experience is keyboard navigable and screen-reader friendly.
  - Swedish is the default language on first visit.
  - Language toggle supports Swedish, English, and Arabic at launch.
  - Arabic support includes right-to-left layout considerations.

- **Responsive, mobile-first UI** (Priority: P0)
  - The site must be responsive and designed mobile-first.
  - Primary target viewport is iPhone 13 mini size.

## 5. User experience

### 5.1 Entry points & first-time user flow

- Land on a Malmö-focused homepage with a clear value proposition: compare preschools using official survey results.
- City selector shows Malmö selected, with Stockholm and Göteborg visible but disabled.
- Survey year defaults to the latest available for Malmö (2025), is clearly visible, and is not changeable in the MVP.
- Browse preschools, add 2–5 to compare, open comparison view.
- Optionally add up to five to the shortlist, share link, and/or email it.

### 5.2 Core experience

- **Browse directory**: users scan a list of preschools and can quickly add/remove schools to compare and/or shortlist.
  - Ensures a positive experience by minimizing clicks and keeping selection state visible.
- **Open comparison view**: users see a side-by-side table plus accessible charts for “Helhetsbedömning” (MVP).
  - Ensures a positive experience by making differences obvious and consistent across schools.
- **Read plain-language summaries**: users can understand trade-offs without interpreting raw percentages.
  - Ensures a positive experience by reducing cognitive load and supporting low-literacy scenarios.
- **Build “pick five” list**: users curate up to five schools and review the final list.
  - Ensures a positive experience by directly matching the real municipal process.
- **Share and collaborate**: users copy a link that restores state.
  - Ensures a positive experience by enabling co-parent decision-making without accounts.

### 5.3 Advanced features & edge cases

- Users compare only 1 school (comparison view still works and encourages adding more).
- Users select more than 5 schools for compare or shortlist (clear error and guidance).
- Users open a shared link with unknown/removed preschools (show graceful fallback and explain what changed).
- Users switch language while in compare view (state remains, translation is consistent).
- Users with reduced motion preferences (no essential motion; keep transitions optional).

### 5.4 UI/UX highlights

- Persistent, obvious selection state for compare and shortlist.
- High-contrast, color-blind-safe chart palette and non-color encodings (labels/patterns).
- Responsive table design that remains usable on mobile.
- Mobile-first layout tuned for iPhone 13 mini.
- Clear source attribution near every summary and in an “about the data” section.

## 6. Narrative

A parent in Malmö starts with a long list of preschools and little time. They quickly narrow the options, compare several schools side-by-side using official survey data, and understand the trade-offs through clear visuals and plain-language summaries. They then pick five preschools, share the list with their partner using a link that restores everything, and email the shortlist for later—without creating an account or sharing personal data.

## 7. Success metrics

The MVP will not include usage tracking/analytics, to avoid third-party tools and preserve a fully static deployment. MVP success will be evaluated via accessibility/performance audits and qualitative user feedback.

### 7.1 User-centric metrics

- Time for a parent to create a shortlist of five preschools in a moderated usability test.
- Qualitative feedback that comparison is “easy to understand” across Swedish/English/Arabic.
- Accessibility usability feedback (qualitative) from keyboard/screen reader users.

### 7.2 Business metrics

- Qualitative validation that the site increases trust in the municipality’s published data (user interviews).
- Coverage of Malmö preschools represented as JSON vs official source.

### 7.3 Technical metrics

- Lighthouse accessibility score target: 100 (aspirational) and never below 95 on key pages.
- Total page weight and time-to-interactive on low-end mobile.
- Zero runtime dependencies on third-party APIs for core features.

## 8. Technical considerations

### 8.1 Integration points

- Static JSON files in the repository; one JSON file per preschool and year (for example `2025-name-of-preschool.json`).
- Official source overview page(s) linked for attribution and deeper reading.
- Optional browser APIs only: Clipboard API for copying links; Geolocation API for distance (opt-in).

### 8.2 Data storage & privacy

- No user accounts.
- No server-side storage.
- Share links encode state in the URL (for example compressed JSON payload) and should avoid including personal data.
- Email uses `mailto:` and is handled by the user’s email client.
- If any analytics are added later, they must be optional, privacy-preserving, and compatible with a static deployment.

### 8.3 Scalability & performance

- The site must function as static assets served via a CDN.
- Data loading should be incremental (load directory index first; fetch preschool JSON as needed).
- Comparison view should handle at least 5 preschools smoothly on mid-range mobile devices.

### 8.4 Potential challenges

- Maintaining data accuracy and provenance when converting PDFs to JSON.
- Presenting charts accessibly (tables/text alternatives required).
- Right-to-left layout for Arabic while keeping comparison tables usable.
- Defining a transparent, defensible ranking method for the directory list.
- Generating plain-language summaries without AI (requires careful deterministic rules and well-written templates).
- Distance calculation without external APIs (requires static coordinates and clear disclaimer: straight-line distance).

## 9. Milestones & sequencing

### 9.1 Project estimate

- MVP (Phase 1 only): 2–4 weeks
- Full initial release (Phases 1–3): 4–8 weeks
- Notes/assumptions:
  - LLM AI agents can accelerate implementation, but the critical path still includes human oversight, accessibility validation, multilingual QA (including RTL), and data preparation.
  - Estimate assumes the JSON dataset exists or can be produced at a steady cadence.

### 9.2 Team size & composition

- 1 human architect/overseer plus LLM AI agents covering: product/design, frontend engineering, data/content maintenance, and accessibility review

### 9.3 Suggested phases

- **Phase 1**: Data model and Malmö MVP comparison (2–3 weeks)
  - Static site skeleton, Malmö-only city selector, locked survey year (2025) visible but not changeable.
  - Directory with ranked list + sorting.
  - Compare tray and side-by-side comparison for 2–5 schools.
  - MVP survey scope: “Helhetsbedömning” question group only.
  - Basic attribution and link to official overview page.
- **Phase 2**: Shortlist, sharing, and multilingual (1–3 weeks)
  - Pick-five shortlist.
  - Shareable URL with versioned payload.
  - Swedish/English/Arabic translations and RTL support.
  - Email via `mailto:`.
- **Phase 3**: Guidance and criteria (1–2 weeks)
  - Guided “pick five” flow.
  - Operator type, profiles, and distance filtering (if coordinates available).
  - Polish accessibility, performance, and content clarity.
- **Phase 4 (post-MVP)**: PDF to JSON conversion pipeline (timeboxed spike)
  - Create a conversion pipeline script/app that transforms the municipality PDF outputs into the project’s JSON format.

## 10. User stories

### 10.1 Browse Malmö preschools

- **ID**: GH-001
- **Description**: As a parent, I want to browse preschools in Malmö so I can find candidates to compare.
- **Acceptance criteria**:
  - The city selector shows Malmö selected and Malmö is selectable.
  - Stockholm and Göteborg are visible as placeholders but are not selectable in the MVP.
  - The directory lists available preschools for the Malmö survey year 2025.
  - The survey year (2025) is visible and not changeable in the MVP.
  - Each preschool entry shows at least name and address.

### 10.2 View preschool details

- **ID**: GH-002
- **Description**: As a parent, I want to open a preschool’s details so I can understand its results and context.
- **Acceptance criteria**:
  - A preschool details view shows name, address, survey year, and grouped survey results.
  - The page includes a clear link to the official source for the data.

### 10.3 Add/remove preschools to compare set

- **ID**: GH-003
- **Description**: As a parent, I want to select preschools to compare so I can evaluate them side-by-side.
- **Acceptance criteria**:
  - I can add and remove a preschool from the compare set from the directory and details view.
  - The UI always reflects the current compare set size.
  - The compare set persists when navigating between pages.

### 10.4 Compare 2–5 preschools side-by-side

- **ID**: GH-004
- **Description**: As a parent, I want a side-by-side comparison so I can quickly see differences across the same questions.
- **Acceptance criteria**:
  - In the MVP, the comparison view shows the “Helhetsbedömning” question group for each selected preschool.
  - Percentages are displayed consistently and labeled clearly.
  - The view remains usable on mobile (no content becomes unreachable), targeting iPhone 13 mini size.

### 10.5 Accessible charts with non-visual alternatives

- **ID**: GH-005
- **Description**: As a user with low vision or color blindness, I want charts that are accessible so I can understand results.
- **Acceptance criteria**:
  - Every chart has an equivalent table or text summary.
  - Information is not conveyed by color alone.
  - Screen readers can access the underlying values.

### 10.6 Plain-language comparison summary

- **ID**: GH-006
- **Description**: As a parent, I want a text summary of key differences so I can understand trade-offs quickly.
- **Acceptance criteria**:
  - The summary references specific question groups/questions and is consistent with the displayed data.
  - The summary avoids subjective language and indicates uncertainty where appropriate.
  - The summary is generated without AI using deterministic rules and prewritten templates.

### 10.7 Create a shortlist of up to five

- **ID**: GH-007
- **Description**: As a parent, I want to select up to five preschools so I can match the municipality application process.
- **Acceptance criteria**:
  - I can add/remove items from the shortlist.
  - The shortlist enforces a maximum of five and explains the limit.
  - The shortlist is visible and reviewable before sharing.

### 10.8 Share a link that restores full state

- **ID**: GH-008
- **Description**: As a parent, I want a share link that restores my compare set and shortlist so I can collaborate without accounts.
- **Acceptance criteria**:
  - The share link restores city, year, compare set, and shortlist when opened.
  - The payload format is versioned.
  - If some items no longer exist, the UI explains what could not be restored.

### 10.9 Email my shortlist

- **ID**: GH-009
- **Description**: As a parent, I want to email the shortlist to myself/partner so I can keep it for later.
- **Acceptance criteria**:
  - The site opens the user’s email client with a prefilled subject and body.
  - The email includes a share link and the list of selected preschools.

### 10.10 Switch language (Swedish/English/Arabic)

- **ID**: GH-010
- **Description**: As a user, I want to view the site in my language so I can understand it.
- **Acceptance criteria**:
  - Swedish is the default language on first visit.
  - A language selector supports Swedish, English, and Arabic.
  - Switching language preserves compare and shortlist state.
  - Arabic uses right-to-left layout where appropriate.

### 10.11 Keyboard-only navigation

- **ID**: GH-011
- **Description**: As a keyboard-only user, I want to use all features without a mouse.
- **Acceptance criteria**:
  - All interactive elements are reachable via tab.
  - Focus order is logical and visible.
  - Comparison tables and controls are operable via keyboard.

### 10.12 Data attribution and trust

- **ID**: GH-012
- **Description**: As a user, I want to know where the data comes from so I can trust it.
- **Acceptance criteria**:
  - Each preschool and comparison view includes attribution to the local government.
  - The site links to the official overview/source page(s) for the reports (for Malmö: the Förskoleenkäten overview page).

### 10.13 Independent preschool queue links

- **ID**: GH-013
- **Description**: As a parent, I want a direct link to an independent preschool’s queue instructions so I can apply correctly.
- **Acceptance criteria**:
  - Independent preschools display a prominent link to their official queue/homepage.
  - Municipal preschools do not display irrelevant queue links.

### 10.14 Filter by operator type and profiles

- **ID**: GH-014
- **Description**: As a parent, I want to filter options by practical criteria so I can find relevant preschools faster.
- **Acceptance criteria**:
  - I can filter the directory by operator type.
  - I can filter by one or more profiles/tags if provided in data.
  - Filters are keyboard and screen-reader accessible.

### 10.15 Optional distance-based narrowing without external APIs

- **ID**: GH-015
- **Description**: As a parent, I want to narrow by distance so I can prioritize nearby preschools.
- **Acceptance criteria**:
  - If preschool coordinates exist, the UI can compute straight-line distance from a user-provided point or geolocation (opt-in).
  - A geolocation permission prompt is only triggered by an explicit, informed user action.
  - The UI clearly states it is straight-line distance.
  - The feature works without calling external APIs.

### 10.19 Sort and rank the directory list

- **ID**: GH-019
- **Description**: As a parent, I want the preschool list to be ranked/sortable so I can find strong options quickly.
- **Acceptance criteria**:
  - The directory has a default ranking method and at least one alternate sort.
  - The ranking method is clearly explained and is based only on available JSON data.

### 10.20 Use a persistent compare tray

- **ID**: GH-020
- **Description**: As a parent, I want a persistent compare tray so I can see what I’ve selected and open the comparison easily.
- **Acceptance criteria**:
  - The tray is visible (or easily reachable) on mobile-first layouts.
  - The tray lists selected preschools and allows removal.
  - The tray has a clear action to open the side-by-side comparison.

### 10.16 Guided flow to pick five

- **ID**: GH-016
- **Description**: As an uncertain parent, I want a guided flow that suggests five preschools based on my criteria.
- **Acceptance criteria**:
  - The flow asks about priorities and constraints.
  - Suggestions are explained (for example, weights or rules used).
  - The user can accept, adjust, or restart the suggestions.

### 10.17 No-login security posture

- **ID**: GH-017
- **Description**: As a privacy-conscious user, I want the site to work without accounts and without collecting personal data.
- **Acceptance criteria**:
  - No account creation or login is required for any core feature.
  - Share links do not include personal data.
  - The site documents what is stored in the URL and why.

### 10.18 Handle missing or partial data

- **ID**: GH-018
- **Description**: As a user, I want the site to handle missing survey questions gracefully so comparisons remain understandable.
- **Acceptance criteria**:
  - Missing values are labeled clearly (for example “Data missing”).
  - Comparisons do not break when a preschool file lacks a question group.
  - The UI does not imply precision where data is incomplete.

## Approval

If this PRD looks right, reply “approved” and I’ll treat it as the baseline spec. If you want adjustments, tell me what to change (scope, MVP cut, or prioritization) and I’ll revise it.
