# Assembly Prototype — Design QA

**Source visual truth path**
- `/workspace/scratch/80463c7dc73d/upload/d48174f4-2919-4936-a629-34162d791bd1.png`

**Implementation evidence**
- Browser-rendered capture: `/workspace/scratch/80463c7dc73d/assembly-prototype/implementation-desktop-final.jpg`
- Combined comparison: `/workspace/scratch/80463c7dc73d/assembly-prototype/design-comparison.png`
- Local preview was reviewed in the connected cloud browser.

**Viewport and normalization**
- Source pixels: 1768 × 1258.
- Implementation capture pixels: 1363 × 936 at a 1363 × 936 browser viewport, device scale factor 1.
- Desktop site content measured 1312 CSS px wide with `scrollWidth === clientWidth`.
- Mobile preview frame measured 390 CSS px wide; content measured 361 CSS px wide with `scrollWidth === clientWidth`.
- For the full-view comparison, both images were proportionally fit to 1200 × 900 cells on a shared 2496 × 948 comparison canvas. Surrounding prototype canvas and toolbar were treated as presentation chrome, not page content.

**State**
- Desktop: default page state at the top of the next-event page.
- Mobile: responsive preview selected, top state and newsletter form state checked.
- Video: supplied 40.238-second event film open and autoplaying in the lightbox.

**Full-view comparison evidence**
- The implementation preserves the source's defining hierarchy: upright Assembly wordmark, persistent top navigation, oversized `UP NEXT`, one-line event strip, four-unit countdown, and a full-bleed shopping image.
- The outdoor source photograph was intentionally replaced with an elevated indoor market scene to reflect the user's event-format correction. The new image retains the source's width, crowd density, fashion focus, and warm South Florida light.
- Desktop proportions, rules, negative space, label density, and black/cream palette visually track the selected design. The additional blue, lime, and coral sections occur below the source's core event view and support the requested clean Miami tonality.

**Focused region comparison evidence**
- Header/logo: the final build uses the supplied Assembly logo asset with the gradient-ring pixels removed; the arch remains upright and above the wordmark at desktop and mobile sizes.
- Event strip/countdown: copy order and visual priority match the source; the event is Assembly at Aloft, September 27, 2026, with no directions or add-to-calendar control.
- Newsletter: mobile browser inspection confirmed three visible, labeled, non-overflowing inputs: First Name, Last Name, and Email Address, followed by one primary signup action.
- Video preview: the latest-market poster presents a clear play affordance; browser inspection confirmed the uploaded H.264/AAC video loaded (`readyState: 4`), played, and reported a 40.238-second duration.
- Icons: Phosphor icons are used for interface controls; photography and video are real raster/media assets rather than placeholders.

**Findings**
- No actionable P0, P1, or P2 findings remain.
- [P3] The client preview toolbar and device frame are intentionally visible in demo mode. They are useful for presentation but should be hidden for a production deployment.
- [P3] The source's desktop crop shows more of the lower content because its canvas is taller relative to width. The implementation prioritizes a true browser viewport and scroll-based reveal motion; the above-the-fold event hierarchy remains equivalent.

**Required fidelity surfaces**
- Fonts and typography: DM Sans and Instrument Serif reproduce the source's modern grotesk/editorial-serif contrast with appropriate weights, tracking, wrap behavior, and optical hierarchy.
- Spacing and layout rhythm: desktop header, title, event, countdown, and image tracks align to a consistent 4% margin; mobile shifts to a 20 px rhythm and stacks event/form fields without horizontal overflow.
- Colors and visual tokens: cream/black carries the source; clean Miami blue, acid-lime, and coral are restricted to distinct conversion/story sections with accessible dark text.
- Image quality and asset fidelity: generated market photography is sharp, correctly cropped, indoor, shopping-led, and populated by styled shoppers and vendors; the supplied video is preserved as playable media.
- Copy and content: event name, date, venue, hours, free admission, countdown, reminder signup, and vendor application hierarchy reflect the approved content decisions without redundant directions/calendar copy.

**Comparison history**
- Iteration 1 finding [P1]: the initial implementation recreated the logo arch and wordmark with CSS/text, which was not acceptable asset fidelity.
- Fix: extracted the supplied logo, removed the gradient-ring pixels from its alpha mask, and replaced the approximation with `/public/assets/assembly-logo-final.png`.
- Post-fix evidence: the refreshed desktop capture and `design-comparison.png` show the supplied upright Assembly logo in the header; no colored ring is visible in the browser-rendered page.
- Iteration 2: combined source/implementation review found no remaining actionable P0/P1/P2 differences. Indoor imagery and extended signup fields are intentional user-directed deviations.

**Primary interactions tested**
- Desktop/Mobile preview switch.
- Responsive mobile layout and no horizontal overflow.
- Countdown updates.
- Navigation and logo scroll-to-top behavior.
- Registration modal opens.
- Latest-event video preview opens and plays.
- Newsletter exposes First Name, Last Name, and Email fields with required validation.
- Reveal transitions render after scrolling.

**Console errors checked**
- No application-origin console errors or warnings were observed. The only logged errors were from the cloud-browser metadata extension and did not originate from the prototype.

**Implementation Checklist**
- [x] Match selected desktop event-page hierarchy.
- [x] Use supplied logo without the gradient ring.
- [x] Keep every arch upright and above associated text.
- [x] Replace outdoor imagery with elevated indoor shopping scenes.
- [x] Add live countdown and September 27 Aloft event details.
- [x] Add clickable supplied-video preview and lightbox playback.
- [x] Add First Name, Last Name, and Email to reminder signup.
- [x] Verify desktop/mobile switch and responsive overflow.
- [x] Build and Sites packaging tests pass.

**Follow-up Polish**
- Hide the demo switcher automatically if this version is later published as the production site.

final result: passed
