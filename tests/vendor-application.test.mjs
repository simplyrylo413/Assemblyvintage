import assert from 'node:assert/strict'
import test from 'node:test'
import vendorApplication, { createVendorApplication } from '../netlify/functions/vendor-application.mts'

const validApplication = () => ({
  markets: ['november'],
  spaceSize: '8x10',
  businessName: 'The Vintage Shop',
  contactName: 'Vendor Name',
  email: 'vendor@example.com',
  phone: '555-555-1234',
  categories: ['Vintage clothing'],
  photoUrls: [1, 2, 3].map((number) => `https://drive.google.com/file/d/photo-${number}/view`),
  businessDescription: 'A curated selection of vintage clothing.',
  inventoryPriceRange: '$75–$300',
  promotionAgreed: true,
  vendorTermsAgreed: true,
})

function submit(body, handler = vendorApplication) {
  return handler(new Request('https://example.test/api/vendor-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
}

function memoryStore() {
  const writes = []
  const binaryWrites = []
  const records = new Map()
  return {
    writes,
    binaryWrites,
    records,
    async set(key, value) {
      binaryWrites.push({ key, value })
      records.set(key, value)
    },
    async setJSON(key, value) {
      const snapshot = structuredClone(value)
      writes.push({ key, value: snapshot })
      records.set(key, snapshot)
    },
    async get(key) {
      return records.get(key) ?? null
    },
  }
}

test('does not accept applications for completed markets', async (t) => {
  for (const market of ['september', 'october']) await t.test(market, async () => {
    const response = await submit({ ...validApplication(), markets: [market] })
    assert.equal(response.status, 400)
    assert.match((await response.json()).error, /Choose at least one market/)
  })
})

test('requires a description, price range, and both affirmative agreements', async (t) => {
  const missingFields = [
    ['businessDescription', 'Describe your business'],
    ['inventoryPriceRange', 'general price range'],
    ['promotionAgreed', 'promotional post requirement'],
    ['vendorTermsAgreed', 'vendor terms'],
  ]

  for (const [field, message] of missingFields) {
    await t.test(field, async () => {
      const application = validApplication()
      delete application[field]
      const response = await submit(application)
      assert.equal(response.status, 400)
      assert.match((await response.json()).error, new RegExp(message))
    })
  }

  const application = validApplication()
  application.vendorTermsAgreed = 'true'
  assert.equal((await submit(application)).status, 400)
})

test('forwards the new fields with safe text and server-controlled terms metadata', async () => {
  const originalFetch = globalThis.fetch
  const originalNetlify = globalThis.Netlify
  const payloads = []
  const store = memoryStore()
  const handler = createVendorApplication({ openStore: () => store })

  globalThis.Netlify = { env: { get: (key) => ({
    VENDOR_APPLICATION_WEBHOOK_URL: 'https://script.google.com/macros/s/test/exec',
    VENDOR_APPLICATION_WEBHOOK_SECRET: 'test-secret',
  })[key] } }
  globalThis.fetch = async (_url, options) => {
    payloads.push(JSON.parse(options.body))
    return new Response(JSON.stringify({ ok: true, allEmailsSent: true }), { status: 200 })
  }

  try {
    const response = await submit({
      ...validApplication(),
      businessDescription: ' =1+1 ',
      inventoryPriceRange: ' +75–300 ',
      vendorTermsVersion: 'client-supplied-version',
    }, handler)

    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.ok, true)
    assert.equal(result.emailDeliveryStatus, 'sent')
    assert.match(result.applicationId, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/)
    const submissionPayload = payloads.find((payload) => payload.action === 'submit-application')
    const emailPayload = payloads.find((payload) => payload.action === 'application-pdf-ready')
    assert.equal(submissionPayload.businessDescription, "'=1+1")
    assert.equal(submissionPayload.inventoryPriceRange, "'+75–300")
    assert.equal(submissionPayload.promotionAgreed, true)
    assert.equal(submissionPayload.vendorTermsAgreed, true)
    assert.equal(submissionPayload.vendorTermsVersion, 'vendor-agreement-2026-09-25')
    assert.equal(Number.isNaN(Date.parse(submissionPayload.vendorTermsAcceptedAt)), false)
    assert.equal(submissionPayload.secret, 'test-secret')
    assert.equal(submissionPayload.applicationId, result.applicationId)
    assert.equal(emailPayload.notificationEmail, 'assemblyvintageco@gmail.com')
    assert.equal(emailPayload.email, 'vendor@example.com')
    assert.match(emailPayload.applicationPdfBase64, /^[A-Za-z0-9+/]+=*$/)

    assert.equal(store.writes.length, 4)
    assert.equal(store.writes[0].key, `applications/${result.applicationId}`)
    assert.equal(store.writes[0].value.status, 'pending')
    assert.equal(store.writes[1].key, `email-queue/${result.applicationId}.json`)
    assert.equal(store.writes[1].value.status, 'pending')
    assert.equal(store.writes[2].value.status, 'sent')
    assert.equal(store.writes[3].value.status, 'google-accepted')
    assert.equal(store.writes[3].value.emailDeliveryStatus, 'sent')
    assert.equal(store.binaryWrites[0].key, `pdfs/${result.applicationId}.pdf`)
    assert.equal(store.writes[0].value.application.businessName, 'The Vintage Shop')
    assert.equal(store.writes[0].value.application.contactName, 'Vendor Name')
    assert.equal(store.writes[0].value.application.selectedEvents, 'Aloft Delray Beach — Sunday, November 15, 2026')
    assert.deepEqual(store.writes[0].value.application.photoUrls, validApplication().photoUrls)
    assert.equal(store.writes[0].value.application.businessDescription, '=1+1')
    assert.equal(store.writes[0].value.application.inventoryPriceRange, '+75–300')
    assert.equal(store.writes[0].value.application.promotionAgreed, true)
    assert.equal(store.writes[0].value.application.vendorTermsAgreed, true)
    assert.equal(store.writes[0].value.application.vendorTermsVersion, 'vendor-agreement-2026-09-25')
    assert.equal(store.writes[0].value.application.vendorTermsAcceptedAt, submissionPayload.vendorTermsAcceptedAt)
    assert.equal(JSON.stringify(store.writes).includes('test-secret'), false)
  } finally {
    globalThis.fetch = originalFetch
    if (originalNetlify === undefined) delete globalThis.Netlify
    else globalThis.Netlify = originalNetlify
  }
})

test('requires a durable backup before forwarding anything to Google', async () => {
  let forwardCount = 0
  const handler = createVendorApplication({
    openStore: () => ({ setJSON: async () => { throw new Error('Storage unavailable') } }),
    deliver: async () => { forwardCount += 1 },
  })
  const originalError = console.error
  console.error = () => {}
  try {
    const response = await submit(validApplication(), handler)
    assert.equal(response.status, 502)
    assert.equal(forwardCount, 0)
  } finally {
    console.error = originalError
  }
})

test('accepts the application and preserves it when the Google handoff fails', async () => {
  const store = memoryStore()
  const handler = createVendorApplication({
    openStore: () => store,
    deliver: async () => { throw new Error('Webhook unavailable') },
  })
  const originalError = console.error
  console.error = () => {}
  try {
    const response = await submit(validApplication(), handler)
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.ok, true)
    assert.equal(result.googleSynced, false)
    assert.equal(store.writes.length, 2)
    const backup = store.writes[0].value
    assert.equal(backup.status, 'pending')
    assert.equal(backup.application.email, 'vendor@example.com')
    assert.equal(backup.application.businessDescription, validApplication().businessDescription)
    assert.equal(backup.application.vendorTermsAgreed, true)
    assert.equal(store.writes[1].value.status, 'google-sync-failed')
  } finally {
    console.error = originalError
  }
})

test('returns success after Google accepts even if the backup status update fails', async () => {
  const store = memoryStore()
  const originalSet = store.setJSON
  let forwardCount = 0
  store.setJSON = async (key, value) => {
    if (value.status === 'google-accepted') throw new Error('Status update unavailable')
    await originalSet(key, value)
  }
  const handler = createVendorApplication({
    openStore: () => store,
    deliver: async () => { forwardCount += 1 },
  })
  const originalError = console.error
  console.error = () => {}
  try {
    const response = await submit(validApplication(), handler)
    assert.equal(response.status, 200)
    assert.equal((await response.json()).ok, true)
    assert.equal(forwardCount, 2)
    assert.equal(store.writes[0].value.status, 'pending')
  } finally {
    console.error = originalError
  }
})
