# Assembly Vintage

Interactive website for Assembly Vintage Market, built with React and Vite.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Netlify publishes the static site from `dist/client`.

## Vendor application destination

Vendor applications post through Netlify Functions to a Google Apps Script receiver. Set `VENDOR_APPLICATION_WEBHOOK_URL` to the deployed Apps Script `/exec` URL and `VENDOR_APPLICATION_WEBHOOK_SECRET` to the matching Apps Script `WEBHOOK_SECRET` value before publishing. Photos upload individually to the configured Drive folder, and the final application is added to Google Sheets.

The expanded form sends six additional keys. The `Applications` tab has matching columns P:U, but the deployed Apps Script must explicitly write these values into each new row. Its source is not in this repository. The Netlify Function stores a complete copy of each validated application in the site-scoped `vendor-applications` Blob store before forwarding it to Google, so missing webhook mappings can be recovered. Preserve the existing A:O mapping and append:

| Column | Sheet header | Webhook key |
| --- | --- | --- |
| P | Business Description | `businessDescription` |
| Q | Inventory Price Range | `inventoryPriceRange` |
| R | Promotion Agreement | `promotionAgreed` |
| S | Vendor Terms Agreement | `vendorTermsAgreed` |
| T | Vendor Terms Version | `vendorTermsVersion` |
| U | Vendor Terms Accepted At | `vendorTermsAcceptedAt` |

After editing and redeploying the Apps Script, verify one authorized application writes all six columns and all three photo links. Do not assume a successful webhook response proves the new values were saved.
