const LOGO_URL = 'https://assemblyvintageco.com/assets/assembly-logo-final.png'
const INSTAGRAM_URL = 'https://www.instagram.com/assemblyvintageco/'

type TemplateInput = {
  applicationId?: string
  businessName?: string
  contactName?: string
  email?: string
  phone?: string
  website?: string
  instagram?: string
  selectedEvents?: string
  spaceLabel?: string
  spaceSize?: string
  estimatedTotal?: string
  categories?: unknown
  photoUrls?: unknown
  receiptUrl?: string
  submittedAt?: string
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function list(value: unknown) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const single = text(value)
  return single ? [single] : []
}

function escapeHtml(value: unknown) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function detailRow(label: string, value: unknown) {
  return `<tr><td style="padding:11px 0;border-bottom:1px solid rgba(17,17,17,.16);color:#786f65;font-size:11px;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(label)}</td><td style="padding:11px 0;border-bottom:1px solid rgba(17,17,17,.16);font-weight:700;text-align:right;">${escapeHtml(value) || '-'}</td></tr>`
}

function linkList(urls: string[]) {
  if (!urls.length) return '<p style="font-size:14px;line-height:1.45;margin:12px 0 0;">No uploaded photo links were included.</p>'
  return `<ol style="margin:12px 0 0;padding-left:20px;font-size:14px;line-height:1.55;">${urls.map((url) => `<li><a href="${escapeHtml(url)}" style="color:#111111;text-decoration:underline;">${escapeHtml(url)}</a></li>`).join('')}</ol>`
}

function footer() {
  return `<div style="margin-top:24px;padding:16px;background:#111111;color:#f9f8f4;text-align:center;"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;margin-bottom:10px;">Stay connected</div><a href="${INSTAGRAM_URL}" style="display:inline-block;background:#f37a5d;color:#111111;text-decoration:none;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;padding:12px 16px;">Follow @assemblyvintageco</a><p style="font-size:12px;line-height:1.4;color:#d8d2c7;margin:12px 0 0;">Vendor drops, market updates, and event photos.</p></div>`
}

export function buildApplicantEmailHtml(input: TemplateInput) {
  const categories = list(input.categories).join(', ')
  return `<div style="margin:0;padding:28px;background:#f9f8f4;color:#111111;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:640px;margin:0 auto;background:#fffdf7;border:1px solid #ded5c8;padding:28px;"><img src="${LOGO_URL}" alt="Assembly Vintage Market" style="display:block;width:126px;height:auto;margin:0 0 22px 0;"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;margin-bottom:10px;">APPLICATION RECEIVED</div><h1 style="font-family:Georgia,'Times New Roman',serif;font-size:44px;line-height:.94;font-weight:500;margin:0;color:#111111;">Thank you<br>for applying.</h1><div style="width:128px;height:12px;border-bottom:5px solid #f37a5d;margin:18px 0;"></div><p style="font-size:15px;line-height:1.5;margin:0 0 18px;">Hi ${escapeHtml(input.contactName) || 'there'}, thank you for applying to be a vendor at Assembly Vintage Market. We received your application, and a PDF copy of your completed application is attached for your records. We'll be in touch after we review your application.</p><div style="display:inline-block;border:1px solid #111111;border-radius:999px;padding:8px 11px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;margin-bottom:18px;">PDF attached for your records</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:4px;border-top:1px solid rgba(17,17,17,.16);font-size:14px;">${detailRow('Business', input.businessName)}${detailRow('Event', input.selectedEvents)}${detailRow('Space', input.spaceLabel || input.spaceSize)}${detailRow('Estimated booth fee', input.estimatedTotal)}${detailRow('Category', categories)}</table>${footer()}<p style="font-size:14px;line-height:1.45;margin:20px 0 0;">Assembly Vintage Market</p></div></div>`
}

export function buildApplicantEmailText(input: TemplateInput) {
  const categories = list(input.categories).join(', ')
  return [
    `Hi ${text(input.contactName) || 'there'},`,
    '',
    'Thank you for applying to be a vendor at Assembly Vintage Market.',
    '',
    'Here is a quick summary of your application:',
    `Business: ${text(input.businessName)}`,
    `Event: ${text(input.selectedEvents)}`,
    `Space: ${text(input.spaceLabel || input.spaceSize)}`,
    `Estimated booth fee: ${text(input.estimatedTotal)}`,
    `Category: ${categories}`,
    '',
    'A PDF copy of your completed application is attached for your records.',
    '',
    "We'll be in touch after we review your application.",
    '',
    'Assembly Vintage Market',
  ].join('\n')
}

export function buildInternalEmailHtml(input: TemplateInput) {
  const categories = list(input.categories).join(', ')
  const photos = list(input.photoUrls)
  return `<div style="margin:0;padding:28px;background:#f9f8f4;color:#111111;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:720px;margin:0 auto;background:#fffdf7;border:1px solid #ded5c8;padding:28px;"><img src="${LOGO_URL}" alt="Assembly Vintage Market" style="display:block;width:126px;height:auto;margin:0 0 22px 0;"><div style="background:#c7e3ee;border:1px solid #111111;padding:22px;"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;margin-bottom:10px;">INTERNAL REVIEW</div><h1 style="font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:.96;font-weight:500;margin:0;color:#111111;">New vendor<br>application.</h1><div style="width:128px;height:12px;border-bottom:5px solid #f37a5d;margin:18px 0;"></div><p style="font-size:15px;line-height:1.5;margin:0 0 16px;">The full completed application PDF is attached. Uploaded photo links and the permanent PDF receipt URL are included below for internal review.</p></div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:18px;border-top:1px solid rgba(17,17,17,.16);font-size:14px;">${detailRow('Business', input.businessName)}${detailRow('Contact', input.contactName)}${detailRow('Applicant email', input.email)}${detailRow('Phone', input.phone)}${detailRow('Event', input.selectedEvents)}${detailRow('Space', input.spaceLabel || input.spaceSize)}${detailRow('Estimated fee', input.estimatedTotal)}${detailRow('Categories', categories)}${detailRow('Website', input.website)}${detailRow('Instagram', input.instagram)}${detailRow('Submitted', input.submittedAt)}${detailRow('Application ID', input.applicationId)}</table><div style="margin-top:20px;"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;margin-bottom:8px;">Uploaded photo links</div>${linkList(photos)}</div><div style="margin-top:20px;"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;margin-bottom:8px;">Permanent PDF receipt URL</div><p style="font-size:14px;line-height:1.45;margin:0;"><a href="${escapeHtml(input.receiptUrl)}" style="color:#111111;text-decoration:underline;">${escapeHtml(input.receiptUrl)}</a></p></div>${footer()}</div></div>`
}

export function buildInternalEmailText(input: TemplateInput) {
  const categories = list(input.categories).join(', ')
  const photos = list(input.photoUrls)
  return [
    'New Assembly Vintage vendor application.',
    '',
    'The full completed application PDF is attached.',
    '',
    `Business: ${text(input.businessName)}`,
    `Contact: ${text(input.contactName)}`,
    `Applicant email: ${text(input.email)}`,
    `Phone: ${text(input.phone)}`,
    `Event: ${text(input.selectedEvents)}`,
    `Space: ${text(input.spaceLabel || input.spaceSize)}`,
    `Estimated fee: ${text(input.estimatedTotal)}`,
    `Categories: ${categories}`,
    `Website: ${text(input.website)}`,
    `Instagram: ${text(input.instagram)}`,
    `Submitted: ${text(input.submittedAt)}`,
    `Application ID: ${text(input.applicationId)}`,
    '',
    'Uploaded photo links:',
    ...(photos.length ? photos : ['No uploaded photo links were included.']),
    '',
    `Permanent PDF receipt URL: ${text(input.receiptUrl)}`,
  ].join('\n')
}
