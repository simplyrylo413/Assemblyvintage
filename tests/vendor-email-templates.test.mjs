import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildApplicantEmailHtml,
  buildApplicantEmailText,
  buildInternalEmailHtml,
  buildInternalEmailText,
} from '../netlify/functions/_shared/vendor-email-templates.mts'

const application = {
  applicationId: '82bb3da8-76f7-4f78-91b0-907a30993099',
  receiptUrl: 'https://assemblyvintageco.com/api/vendor-application-pdf?id=82bb3da8-76f7-4f78-91b0-907a30993099',
  businessName: 'Rylo Vintage <script>',
  contactName: 'Albert',
  email: 'vendor@example.com',
  phone: '555-555-1212',
  website: 'https://example.com',
  instagram: '@rylovintage',
  selectedEvents: 'Aloft Delray Beach - Sunday, October 25, 2026',
  spaceLabel: '8 x 10',
  estimatedTotal: '$300',
  categories: ['Vintage jewelry'],
  photoUrls: ['https://assemblyvintageco.com/api/vendor-photo?id=photo-1'],
  submittedAt: '2026-10-10T20:49:28.000Z',
}

test('applicant email is branded HTML and excludes internal review links', () => {
  const html = buildApplicantEmailHtml(application)
  const plain = buildApplicantEmailText(application)

  assert.match(html, /<img class="email-logo" src="https:\/\/assemblyvintageco\.com\/assets\/assembly-logo-final\.png"/)
  assert.match(html, /@media only screen and \(max-width: 520px\)/)
  assert.match(html, /APPLICATION RECEIVED/)
  assert.match(html, /Thank you<br>for applying\./)
  assert.match(html, /Follow us on Instagram/)
  assert.match(html, /@assemblyvintageco/)
  assert.match(html, /Rylo Vintage &lt;script&gt;/)
  assert.doesNotMatch(html, /vendor-photo/)
  assert.doesNotMatch(html, /Application ID/)
  assert.doesNotMatch(html, /Permanent PDF/)
  assert.doesNotMatch(plain, /vendor-photo/)
  assert.doesNotMatch(plain, /82bb3da8/)
})

test('internal email is branded HTML and includes review-only links', () => {
  const html = buildInternalEmailHtml(application)
  const plain = buildInternalEmailText(application)

  assert.match(html, /INTERNAL REVIEW/)
  assert.match(html, /@media only screen and \(max-width: 520px\)/)
  assert.match(html, /New vendor<br>application\./)
  assert.match(html, /Uploaded photo links/)
  assert.match(html, /vendor-photo/)
  assert.match(html, /Permanent PDF receipt URL/)
  assert.match(html, /Follow us on Instagram/)
  assert.match(html, /@assemblyvintageco/)
  assert.match(plain, /Application ID: 82bb3da8/)
  assert.match(plain, /Permanent PDF receipt URL:/)
})
