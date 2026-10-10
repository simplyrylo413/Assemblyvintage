# Assembly Vintage Vendor Application Workflow

## Source Of Truth

When a vendor submits an application through assemblyvintageco.com, the workflow must:

1. Save the submitted application data to the existing Google Docs / Google Sheets destination used by the current workflow.
2. Generate the vendor application PDF from the exact completed on-screen application using the current PDF workflow.
3. Send a PDF copy to the vendor email address provided in the submitted application data.
4. Send a second copy to `assemblyvintageco@gmail.com`.
5. Preserve the stored PDF receipt/recovery behavior already used by the site.

## Implementation Guardrail

Do not change the current Google Sheet capture flow, PDF generation flow, field mapping, photo-link handling, webhook endpoint behavior, or internal Assembly notification behavior unless explicitly requested.

The durable additions to preserve are:

- send the same completed application PDF to the applying vendor's submitted email address.
- send both vendor and internal emails as styled HTML using the approved Assembly email template.
- keep both emails readable on mobile.

## Required Email Behavior

The Assembly copy sent to `assemblyvintageco@gmail.com` should include:

- vendor/application summary
- uploaded photo or download links
- attached PDF copy of the full application

The vendor copy should include:

- attached PDF copy of their submitted application
- a short confirmation that Assembly Vintage received the application

## Required Email Style

Use the approved Option 1 / Editorial Confirmation email style for both the vendor-facing copy and the internal Assembly copy.

Shared style requirements:

- include the Assembly logo at the top using `https://assemblyvintageco.com/assets/assembly-logo-final.png`
- use an Assembly Vintage look and feel: cream or pale-blue background, black ink text, coral accent rule/button, clean table-style details, and simple editorial spacing
- include an Instagram footer or CTA linking to `https://www.instagram.com/assemblyvintageco/`
- the footer label must say `Follow us on Instagram`
- include an Instagram logo/icon in the footer CTA
- show the Instagram address `@assemblyvintageco`
- include the supporting line `Vendor drops, market updates, and event photos.`
- send the visible email body as styled HTML, not plain-text-only
- use simple Gmail-compatible inline styles and a readable plain-text fallback
- include mobile-responsive email CSS so phone views use compact padding, readable text sizes, stacked details, and a full-width footer CTA
- attach the completed application PDF as a separate attachment part

## Sending Account And Environment

- The formatted vendor emails should be sent from the Assembly Vintage Gmail / Apps Script owner account: `assemblyvintageco@gmail.com`.
- Netlify production must point `VENDOR_APPLICATION_WEBHOOK_URL` to the Assembly-owned Apps Script `/exec` deployment.
- Netlify production must set `VENDOR_APPLICATION_WEBHOOK_SECRET` to the same value stored as the Apps Script `WEBHOOK_SECRET` script property.
- Do not store the actual secret value in the repository or public workflow documentation.
- If email styling disappears, first verify that Netlify is deployed with the latest code and environment variables, then verify the Apps Script uses `htmlBody` for both `MailApp.sendEmail` calls.

## Vendor-Facing Email

- label: `APPLICATION RECEIVED`
- headline: `Thank you for applying.`
- warm confirmation copy that the application was received and the PDF is attached for the vendor's records
- simple details table with Business, Event, Space, Estimated booth fee, and Category
- callout/pill text: `PDF attached for your records`
- do not include internal links, Google Sheet links, Google Drive links, photo links, application ID, permanent PDF URL, or internal notes

## Internal Assembly Email

- label: `INTERNAL REVIEW`
- headline: `New vendor application.`
- concise application summary with business name, contact name, applicant email, phone, selected event(s), space size, estimated fee, categories, website, Instagram, and submitted timestamp when available
- include uploaded photo links and the permanent PDF receipt URL for internal review
- clearly note that the full completed application PDF is attached

## Verification Checklist

Before publishing any future vendor-application code changes, verify:

- a submitted application still reaches the current Google Sheet
- `assemblyvintageco@gmail.com` receives the internal application email
- the internal email includes the summary, photo/download links, and PDF attachment
- the vendor-provided email receives a PDF copy
- both emails use the approved Option 1 / Editorial Confirmation style with the Assembly logo and Instagram link
- the footer says `Follow us on Instagram`, includes the Instagram logo/icon, and shows `@assemblyvintageco`
- phone email previews are not cramped: details stack cleanly and the Instagram CTA spans the available width
- no existing field names, Google Apps Script endpoint, or PDF generation behavior was unintentionally changed
