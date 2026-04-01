# Research: Survey PDF Link on Detail Pages

**Branch**: `013-survey-pdf-link` | **Date**: 2026-03-31

## Research Summary

All technical context items were resolved during spec clarification. No NEEDS CLARIFICATION items remain. This document records the key decisions and their rationale.

## Decisions

### 1. PDF URL Storage Location

**Decision**: Store `surveyPdfUrl` as an optional field in each preschool's per-year survey JSON file (`data/malmo/2025/*.json`).

**Rationale**: The PDF URL is year-specific data — each survey year has its own set of PDFs. Storing it alongside the survey responses (not in the city index) keeps year-specific data co-located. The city index (`data/malmo/index.json`) contains stable identity data (name, address, operator type); the survey JSON contains year-specific measurement data. The PDF URL belongs with the latter.

**Alternatives considered**:
- **City index file**: Rejected. The index is year-agnostic identity data. When a future survey year is added, PDF URLs would need to move anyway. Keeping them in the survey JSON avoids this migration.
- **Computed from preschool name**: Rejected. Official PDF filenames are inconsistent with canonical preschool names (e.g., "Duvans montessoriförskola" → `montessoriförskolan duvan`). Computing URLs would produce broken links.
- **Separate mapping file**: Rejected. Adds unnecessary indirection. The survey JSON already has a 1:1 relationship with each preschool.

### 2. Link Placement in Actions Area

**Decision**: Place the PDF link after all existing action buttons (compare button and, when present, queue link).

**Rationale**: The compare button is the primary interactive action (adding to shortlist). The queue link is a conversion action (registering for enrollment). The PDF link is a secondary reference action (verifying data source). This ordering reflects the action hierarchy: primary → conversion → reference.

**Alternatives considered**:
- **Before the queue link**: Rejected. Would demote the more actionable queue enrollment link below a passive reference link.
- **In the survey results section**: Rejected. Would be less discoverable. The actions area is the established location for all preschool-specific links and buttons.
- **As a footnote/attribution**: Rejected. Too subtle for users who specifically want to verify data.

### 3. Implementation Pattern

**Decision**: Follow the existing queue link pattern in `DetailPage.astro` — conditional rendering with URL validation, same CSS classes (outlined secondary button style), same security attributes (`rel="noopener noreferrer"`, `target="_blank"`).

**Rationale**: The queue link (spec 004) solved the same UX problem: rendering an optional external link in the actions area. Reusing the same pattern ensures visual consistency, accessibility compliance, and code maintainability. No new abstractions needed.

**Alternatives considered**:
- **Extract a shared "external link" component**: Rejected. Only two instances (queue link + PDF link). Extracting a component for two usages is premature abstraction per the Architecture Discipline principle.
- **Use a Preact island**: Rejected. The link is fully static — no client-side state, no event handlers, no sessionStorage dependency. An Astro-rendered `<a>` tag is sufficient and adds zero JS.

### 4. Data Population Strategy

**Decision**: Manually add `surveyPdfUrl` to each of the ~260 survey JSON files by matching preschool names to the official PDF URLs listed on the Malmö stad results page.

**Source page**: `https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten/Resultat-fran-forskoleenkaten-2025.html`

All PDF URLs follow the pattern `https://forskoleenkatresultat.malmo.se/2025/{preschool-name}.pdf` but the `{preschool-name}` segment uses inconsistent naming (lowercase, sometimes reordered words, sometimes abbreviated).

**Practical approach**:

1. **Extract all PDF URLs** from the source page (e.g., fetch the page and parse all `<a href="...pdf">` links).
2. **Build a mapping** of PDF URL → preschool ID by comparing the URL's filename segment against the `name` field in `data/malmo/index.json`. Normalize both sides (lowercase, trim, strip common suffixes like "förskola") for fuzzy matching.
3. **Apply matches**: For each matched pair, add `"surveyPdfUrl": "https://..."` to the corresponding `data/malmo/2025/{id}.json` file.
4. **Review unmatched**: Manually inspect any PDF URLs that couldn't be auto-matched (naming inconsistencies like "Duvans montessoriförskola" → `montessoriförskolan duvan`).
5. **Skip placeholder surveys**: Files with `totalRespondentsPercent: -1` likely don't have corresponding PDFs — verify and skip.

**Rationale**: The official PDF filenames use inconsistent naming conventions that prevent reliable fully-automated matching. A semi-automated approach (extract + fuzzy match + manual review) balances effort with accuracy. This is a one-time effort per survey year.

**Alternatives considered**:
- **Fully automated name matching script**: Risky due to naming inconsistencies. Would require manual verification anyway, negating the automation benefit.
- **Only add URLs for preschools where the match is obvious**: The feature gracefully handles missing URLs (link is omitted), so partial population is acceptable as an interim step. Full population is the goal.
