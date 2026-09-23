# Assembly Vintage Vendor Application — Design QA

**Source visual truth path**
- `/workspace/scratch/5190b6618973/upload/955a3d14-be28-4067-aafc-db0b91ea3c6a.png`

**Implementation evidence**
- Browser-rendered capture: `/workspace/scratch/5190b6618973/assembly-vintage-live-checkout/vendor-implementation-desktop.png`
- Combined comparison: `/workspace/scratch/5190b6618973/assembly-vintage-live-checkout/vendor-design-comparison.png`
- Local preview reviewed at `http://terminal.local:4173/` in the connected cloud browser.

**Viewport and normalization**
- Source pixels: 1240 × 731.
- Implementation capture: 1363 × 936 pixels at a 1363 × 936 CSS viewport, device scale factor 1.
- Combined comparison: both images were proportionally fit into 1200 × 731 cells on a 2464 × 731 canvas.
- The source shows the panel embedded beside the section. The implementation intentionally presents the same panel as a right-side overlay because the user explicitly requested that it appear only after `Apply to Vend` is clicked.

**State**
- Desktop vendor section with the application overlay open.
- Three events selected.
- `6′ × 4′ — $200` selected; calculated total is $600 for three events.

**Full-view comparison evidence**
- The implementation preserves the source's pale-blue field, high-contrast editorial serif, small tracked labels, black rectangular CTA, left-side application message, future-event list, and numbered three-step explanation.
- The open form maintains the source's right-side emphasis while adding the requested modal behavior, darker backdrop, and background blur to make the active task unambiguous.
- The form width, border treatment, compact two-column density, fine rules, upload area, and black submit action closely track the selected design.

**Focused region comparison evidence**
- Vendor section: headline wrapping, market-list divider, event hierarchy, and numbered process closely match the source.
- Application panel: the event selector supports multiple checked markets; the space selector visibly includes `8′ × 10′ — $300` and `6′ × 4′ — $200`.
- Pricing summary: changing the booth size and event count updates both the selected-space label and estimated total.
- Icons: Phosphor interface icons are used for arrows, close, dropdown, and upload affordances. The supplied Assembly logo asset is cropped to its upright arch for this section.

**Findings**
- No actionable P0, P1, or P2 findings remain.
- [P3] The implementation uses a full-height right-side overlay rather than the source's embedded panel. This is an intentional response to the user's request that the panel remain hidden until `Apply to Vend` is clicked.
- [P3] Google Sheets delivery cannot be exercised locally until the Apps Script webhook or equivalent Sheets endpoint is provided. The form data model is already row-friendly and the project decision is recorded.

**Required fidelity surfaces**
- Fonts and typography: Instrument Serif and DM Sans preserve the editorial display/sans-serif contrast, hierarchy, tracking, and compact UI labels.
- Spacing and layout rhythm: the section uses the source's split layout and generous blue negative space; the overlay uses a dense two-column form and becomes a single column under the mobile breakpoint.
- Colors and visual tokens: the existing Assembly powder blue, black, cream, coral, and lime tokens remain unchanged; this section uses powder blue and black as in the source.
- Image quality and asset fidelity: no photographic assets are required in this section. The existing supplied Assembly logo asset is used instead of a newly drawn logo.
- Copy and content: the market names/dates, multi-event message, three-step process, booth sizes, prices, estimated total, and Google Sheets review language reflect the approved requirements.

**Comparison history**
- Iteration 1 finding [P2]: the cropped logo showed only the lower arch stems and part of the wordmark.
- Fix: adjusted the crop to display the complete upright arch without the wordmark.
- Post-fix evidence: the final browser capture and combined comparison show the corrected arch at the upper-left of the vendor section.
- Iteration 2: the combined source/implementation review found no remaining actionable P0/P1/P2 differences.

**Primary interactions tested**
- `Apply to Vend` opens the panel; the panel is absent before the click.
- Event selector opens and supports multiple checked markets.
- Booth selector changes between the $300 and $200 options.
- Fee summary recalculates using event count × selected booth price.
- Required contact fields accept input and local submission reaches the success state.
- Close/back controls and modal keyboard behavior are implemented.

**Console errors checked**
- No application-origin errors or warnings were observed. Logged errors came from the cloud-browser metadata extension and did not originate from the site.

**Implementation Checklist**
- [x] Recreate the selected blue vendor opportunity section.
- [x] Keep the application panel hidden until the CTA is clicked.
- [x] Add multi-event selection.
- [x] Add `8′ × 10′ — $300` and `6′ × 4′ — $200`.
- [x] Calculate estimated total from event count and booth price.
- [x] Preserve mobile stacking rules.
- [x] Record Google Sheets as the submission destination.
- [x] Build and Sites packaging tests pass.

**Follow-up Polish**
- Connect the form to the provided Google Apps Script/Sheets endpoint and verify a real test row before production publication.

final result: passed
