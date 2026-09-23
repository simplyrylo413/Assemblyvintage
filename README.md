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
