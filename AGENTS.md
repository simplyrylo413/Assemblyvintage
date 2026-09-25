# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Assembly prototype decisions

- The selected visual target is the supplied black-and-white "Up Next" Assembly homepage.
- All event imagery must depict an indoor, elevated vintage market with stylish shoppers and vendors in a festive but shopping-focused atmosphere.
- The client demo must include a Desktop/Mobile preview switch.
- The production Netlify build must not show the Desktop/Mobile preview switch or a simulated device frame. It is one full-width responsive site that adapts automatically at real viewport breakpoints.
- The past-markets area must feature the supplied event video as a clickable preview image that opens and plays in a lightbox.
- The market reminder form must collect first name, last name, and email address.
- The attendee event-registration form includes a separate email-marketing consent checkbox. Keep it optional and checked by default, using the “Keep me in the vintage loop” copy; route checked submissions to Klaviyo once the integration is configured.
- Vendor applications are destined for Google Sheets. Keep submission fields row-friendly and include selected events, space size, price per event, event count, estimated total, contact details, categories, and uploaded-photo references.
- The vendor space options are `8′ × 10′ — $300` and `6′ × 4′ — $200`.
- The vendor application panel stays hidden until the visitor clicks `Apply to Vend`.
- The vendor form uses the selected editorial four-section Market / Your Shop / Expectations / Agreement layout. Its main heading is `Vendor Application`, followed by Albert's approved curation paragraph beginning `We’d love to get to know your shop.` Keep that wording as approved.
- Vendor form Polaroids depict indoor markets only; reuse `vendor-moment.jpg`, `rack-detail.jpg`, and `market-crowd.jpg`. Keep the contemporary editorial style and coral admission-ticket motif. Never show an outdoor market canopy in this flow.
- Clearly label every vendor field Required or Optional, require 3–5 photos with three as the minimum, and keep the complete promotion commitment, important details, curation notice, and vendor agreement readable on mobile.
- The Assembly arch is always upright and above the wordmark; never place it beneath text or invert it.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Publish target

- When Albert asks to publish or deploy Assembly Vintage without naming a destination, ask whether he means the Sites prototype (`assembly-vintage-prototype`) or the live Netlify site (`assembly-vintage`).
- Once he names the destination, update only that target unless he asks to synchronize both.
