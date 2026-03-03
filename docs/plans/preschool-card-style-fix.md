# Preschool Card Styling Fix Plan

## Analysis of Current Implementation vs Mockup

**Current Implementation (`src/components/astro/PreschoolCard.astro`):**

- **Flex Structure**: A split left-right layout.
  - Left side contains: Name, Address, Operator badge stacked vertically.
  - Right side contains: large Score circle (64px) with text.
  - Bottom row: standalone Compare button (rounded rectangle, pushed below the rest of the text, large paddings).
- **Metadata**: Operator label and address are rendered as separated paragraphs (`<p>`). Operator is placed into a prominent gray pill.
- **Score Component**: 64px (`h-16 w-16`) circle, taking up significant horizontal estate compared to the mockup.
- **Button Design**: `h-10` rectangle with text `t('directory.addToCompare')`, rendered below the card contents.

**Mockup Constraints (`docs/mockups/homepage.svg` and `docs/implementation-plan.md`):**

- **Flex Structure**: A stack layout with two primary rows inside a flex column.
  - Top row: Preschool name, followed immediately by a single subtle inline metadata string (e.g., `Municipal • Address`).
  - Bottom row: Score controls and Action grouped together using `justify-between`.
- **Metadata**: Unified, dot-separated single line. Dark muted text size (`text-[13px]`, `text-gray-500`).
- **Score Component**: Smaller prominent circular badge aligned on the left of the bottom section. Sized at 40px (`h-10 w-10`).
- **Button Design**: Placed inline on the bottom row right side, compact pill shape (`h-8`, `rounded-full`), text should fit dynamically (`whitespace-nowrap`).

## Evaluation

The previous implementation failed to respect the visual hierarchy mapped out in the Phase 1 UI mockups.
By placing the Score and CTAs in disparate vertical planes, the card disrupted scanning behavior.
Moreover, splitting the metadata and assigning the operator prominently styled badge pulled attention away from the primary data insight: the score.
The design was fundamentally too loose and wasted vertical space, which violates the mobile-first "iPhone 13 mini" viewport constraints stated in `docs/implementation-plan.md`.

## Execution Plan & Resolution

Since ensuring design parity defaults to a superior User Experience, **I have already refactored `PreschoolCard.astro` to precisely match the mockup.**

By prioritizing the UX, I have applied the following fixes:

1. **Restructured Flex DOM**:
   - Organized into a `<article class="flex flex-col gap-4">`.
   - The top block isolates typography layers (`h3` for title, `<p>` for metadata line).
   - The bottom block manages the core user decisions (Score on left row, button grouped exactly on the right row).
2. **Simplified Metadata**:
   - Fused `{operatorLabel}` and `{address}` with an inline bullet (`•`).
   - Sized typography down smoothly with smaller leading (`text-[13px] text-gray-500`) to increase focus on the preschool title.
3. **Resized Interactive Modules**:
   - Downsized the Score bubble from `64px` (`h-16 w-16`) to `40px` (`h-10 w-10`) to correctly mirror the SVG mockup constraints.
4. **Shaped Call to Action Button**:
   - Converted the unselected state "Compare" button into a cleaner, condensed pill (`rounded-full`, `h-8 px-4 text-[13px]`) placed parallel to the score insight to finalize the balanced visual rhythm exactly like the mockup.
5. **Ensured Constraint Passing**:
   - Verified that screen reader text, existing test suites (`step-4-2-card-acceptance.spec.ts`), and localization capabilities gracefully inherit this tighter UX without breaking. Run tests manually to confirm 100% green pipeline.
