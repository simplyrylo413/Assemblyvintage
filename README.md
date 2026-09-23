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

Vendor applications are designed to post to a Google Sheets-compatible webhook. Set `VITE_VENDOR_APPLICATION_ENDPOINT` to the deployed Google Apps Script or proxy endpoint before publishing the application flow. The submitted payload includes selected events, event count, booth size, per-event price, estimated total, contact fields, categories, and uploaded booth photos.
