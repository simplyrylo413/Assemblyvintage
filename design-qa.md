# Vendor Application design QA

## Evidence

- Source visual truth: `/workspace/scratch/b66dec836981/generated_images/exec-5cf64b27-eee0-4b99-9c5d-13ee76109d0a.png` (selected Option 3 desktop, 1487 × 1058 px), with approved mobile direction at `/workspace/scratch/b66dec836981/generated_images/exec-37a44e60-e3ce-47cc-beca-5a12e39796de.png` (1312 × 1199 px composite).
- Browser-rendered implementation: `/workspace/scratch/assembly-vendor-final-desktop-1790351088620.jpg` (Market) and `/workspace/scratch/assembly-vendor-final-shop-1790351115181.jpg` (Your Shop), 1363 × 936 px at 1363 × 936 CSS px and device scale factor 1.
- The source composite and browser capture have different canvas sizes; comparison used corresponding page content and open section rather than pixel alignment. Source and implementation were viewed together in the same comparison input. Focused inspection covered header typography, indoor collage/ticket, labels, upload counter, and the right form panel; those details were legible in the full captures, so a separate crop was unnecessary.
- Local preview opened in the cloud browser at `terminal.local:4173`. Browser interactions checked opening the CTA, moving between all four sections, required-field errors, category and three-photo validation, selection of three local files with thumbnails, promotion notice, full vendor agreement, and preservation of entered values while navigating. No site-origin console errors were found; Chrome extension metadata errors were unrelated to the application.

## Findings

- **P2 — Mobile visual capture unavailable.** The chosen mobile source cannot be compared against a real 390 px rendering. The connected browser exposes no viewport resize or device emulation, and a separate wrapper route was blocked by browser policy. CSS review suggests a single column with 350 px content at 390 px width, but this is not browser evidence. Obtain a supported mobile browser capture before final visual sign-off.
- **P3 — Intentional source changes.** The approved headline is `Vendor Application`, the full approved curation paragraph replaces the short mock text, and the three existing indoor photographs have restrained color instead of the mock's outdoor/monochrome imagery. These reflect explicit user direction. The coral ticket remains visible.
- **P3 — Different view height.** The source mock shows the entire left navigation at 1058 px canvas height; the 936 px browser capture requires scrolling to see its last items. The modal scrolls, and all four controls are present and reachable.

## Comparison history

1. Initial desktop capture showed the vintage ticket partly hidden by a Polaroid and a monochrome photo treatment. The next iteration raised the ticket above the photos and retained restrained warm color for a more current indoor market feel. Evidence: `/workspace/scratch/assembly-vendor-final-shop-1790351115181.jpg`.
2. Initial validation scrolled to the form top while an invalid photo field could be lower on the page. The next iteration moved the error to the form top and scrolls/focuses the specific invalid control. The final code was rebuilt and verified through browser interaction; no production submission was made.
3. The longer Your Shop panel initially placed its Continue button below the desktop fold. A sticky desktop footer now keeps the fee and action visible, with a normal in-flow footer on mobile to avoid covering the keyboard.

## Implementation checklist

- Capture a real 390 px mobile viewport in a supported browser and compare it to the approved mobile mockup.
- Update/redeploy the Google Apps Script receiver to map all six new Sheet columns, then verify one explicitly authorized test or real application before production publishing.

final result: blocked
