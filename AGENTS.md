# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Assembly prototype decisions

- The selected visual target is the supplied black-and-white "Up Next" Assembly homepage.
- All event imagery must depict an indoor, elevated vintage market with stylish shoppers and vendors in a festive but shopping-focused atmosphere.
- The client demo must include a Desktop/Mobile preview switch.
- The production Netlify build must not show the Desktop/Mobile preview switch or a simulated device frame. It is one full-width responsive site that adapts automatically at real viewport breakpoints.
- The past-markets gallery uses eleven supplied real event photos (the four original market images plus seven new indoor-market images in `public/assets/market-*.jpeg`), without the former video tile or city/date labels beneath the images. The selected Postcard Parade treatment loops right to left at about 48.3 pixels per second with slightly tilted overlapping white photo frames. Resting cards are 15% smaller than the original four-card design; hover grows them to the original hover size, straightens, and lifts a frame without stopping the movement. Clicking pauses and opens a large photo; closing immediately resumes the strip. On touch, tapping opens the photo; reduced-motion settings show a static swipeable strip.
- The market reminder form must collect first name, last name, and email address.
- The attendee event-registration form includes a separate email-marketing consent checkbox. Keep it optional and checked by default, using the “Keep me in the vintage loop” copy; route checked submissions to Klaviyo once the integration is configured.
- The attendee event-registration form also requires an initially unchecked, compact photo/video consent box covering event recording and promotional use of likeness/voice without compensation, including parent/guardian consent for minors brought along. Block registration on the form and API unless checked; record consent version and timestamp in the Klaviyo profile. The email-marketing checkbox remains separate and optional.
- Vendor applications are destined for Google Sheets. Keep submission fields row-friendly and include selected events, space size, price per event, event count, estimated total, contact details, categories, and uploaded-photo references.
- The vendor space options are `8′ × 10′ — $300` and `6′ × 4′ — $200`.
- The vendor application panel stays hidden until the visitor clicks `Apply to Vend`.
- The vendor form uses the selected editorial four-section Market / Your Shop / Expectations / Agreement layout. Its main heading is `Vendor Application`, followed by Albert's approved curation paragraph beginning `We’d love to get to know your shop.` Keep that wording as approved.
- Vendor form Polaroids depict indoor markets only; reuse `vendor-moment.jpg`, `rack-detail.jpg`, and `market-crowd.jpg`. Keep the contemporary editorial style and coral admission-ticket motif. Never show an outdoor market canopy in this flow.
- Clearly label every vendor field Required or Optional, require 3–5 photos with three as the minimum, and keep the complete promotion commitment, important details, curation notice, and vendor agreement readable on mobile.
- The Assembly arch is always upright and above the wordmark; never place it beneath text or invert it.
- The Assembly header logo/brandmark must always render fully inside the header with safe top/bottom breathing room; never let the arch or wordmark appear clipped by the viewport or its container.
- The small arch above `BECOME AN ASSEMBLY VENDOR` must show the complete arch with breathing room on all sides; crop only the wordmark below it.
- The homepage heading reads `SEPTEMBER EDITION` at a moderate scale. The white countdown row reads `THE MARKET` / `STARTS IN`; keep a short coral brush underline starting under `STARTS IN`, and leave the former right-hand quote out.
- The short statement beside the `SEPTEMBER EDITION` heading reads `A CURATED VINTAGE MARKET. GOOD TASTE HAS A GATHERING PLACE. LET'S ASSEMBLE.` Arrange it over three lines.
- On the main page, fade text and content in over one second, with the heading rule, event dividers, and brush underlines drawing over two seconds. Keep related text entering together with only slight offsets. Honor reduced-motion settings.
- Use the supplied pale blue `#c0dceb` for every former lime accent, including registration buttons, hover treatments, play controls, modal close controls, and the mobile menu. Keep the existing other blues and coral accents distinct.
- The footer has matching compact icon-and-label links side by side: `INSTAGRAM` to `https://www.instagram.com/assemblyvintageco/` and `EMAIL` to `mailto:assemblyvintageco@gmail.com`. The footer `CONTACT` link also opens that email address. Keep the footer's coral background, Assembly logo, and short brand statement; avoid large social cards or vague labels.
- The footer `TERMS` link goes to `/terms`. The terms page shares the exact header and footer with the homepage, and header navigation from it returns to the corresponding homepage section. Its copy must allow event admission to be free or paid and vendor count, perks, and promotions to vary by event; use event-specific details for prices, availability, and offers.
- Browser tabs use page-appropriate titles from the initial HTML response: the homepage uses the Assembly Vintage Market brand title, and `/terms` uses `Terms & Conditions | Assembly Vintage Market`. Do not use `Up Next` as the default title on every route.
- The registration modal animates its existing blueprint illustrations once on opening, draws a brief coral stroke under a focused form field, and stamps the successful registration. Keep the form visible immediately and all decorative entrance motion short.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Publish target

- When Albert asks to publish or deploy Assembly Vintage without naming a destination, ask whether he means the Sites prototype (`assembly-vintage-prototype`) or the live Netlify site (`assembly-vintage`).
- Once he names the destination, update only that target unless he asks to synchronize both.
