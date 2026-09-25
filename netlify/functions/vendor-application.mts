import { getStore } from '@netlify/blobs'
import { randomUUID } from 'node:crypto'
import { clean, json, sendToGoogle } from './_shared/vendor-google.mts'

const MARKETS: Record<string, { name: string; date: string }> = {
  september: { name: 'Aloft Delray Beach', date: 'Sunday, September 27, 2026' },
  october: { name: 'Aloft Delray Beach', date: 'Sunday, October 25, 2026' },
  november: { name: 'Aloft Delray Beach', date: 'Sunday, November 15, 2026' },
}

const SPACES: Record<string, { label: string; price: number }> = {
  '8x10': { label: '8′ × 10′', price: 300 },
  '6x4': { label: '6′ × 4′', price: 200 },
}

const ALLOWED_CATEGORIES = new Set([
  'Vintage clothing',
  'Designer resale',
  'Accessories',
  'Home / objects',
  'Other',
])

// Update this when the vendor agreement shown in the application changes.
const VENDOR_TERMS_VERSION = 'vendor-agreement-2026-09-25'

function cleanList(value: unknown, maxItems: number, allowed?: Set<string>) {
  if (!Array.isArray(value)) return []
  return [...new Set(value
    .map((item) => clean(item, 200))
    .filter((item) => item && (!allowed || allowed.has(item))))]
    .slice(0, maxItems)
}

function sheetSafe(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value
}

// Site-scoped storage survives deployments, so the entire application can be
// recovered even if the Google webhook ignores a new field or becomes unavailable.
export function createVendorApplication({
  openStore = () => getStore({ name: 'vendor-applications', consistency: 'strong' }),
  deliver = sendToGoogle,
} = {}) {
  return async (req: Request) => {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid vendor application.' }, 400)
    }

    const marketIds = cleanList(body.markets, 3).filter((id) => MARKETS[id])
    const spaceSize = clean(body.spaceSize, 20)
    const space = SPACES[spaceSize]
    const businessName = clean(body.businessName, 150)
    const contactName = clean(body.contactName, 150)
    const email = clean(body.email, 254).toLowerCase()
    const phone = clean(body.phone, 40)
    const website = clean(body.website, 300)
    const instagram = clean(body.instagram, 100)
    const businessDescription = clean(body.businessDescription, 2000)
    const inventoryPriceRange = clean(body.inventoryPriceRange, 250)
    const categories = cleanList(body.categories, 5, ALLOWED_CATEGORIES)
    const photoUrls = cleanList(body.photoUrls, 5).filter((url) => {
      try {
        return new URL(url).hostname === 'drive.google.com'
      } catch {
        return false
      }
    })

    if (!marketIds.length) return json({ error: 'Choose at least one market.' }, 400)
    if (!space) return json({ error: 'Choose a valid space size.' }, 400)
    if (!businessName || !contactName || !email || !phone) return json({ error: 'Complete all required contact fields.' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400)
    if (!categories.length) return json({ error: 'Choose at least one product category.' }, 400)
    if (!businessDescription) return json({ error: 'Describe your business and what makes it unique.' }, 400)
    if (!inventoryPriceRange) return json({ error: 'Enter the general price range of your inventory.' }, 400)
    if (photoUrls.length < 3) return json({ error: 'Upload at least three product or booth photos.' }, 400)
    if (body.promotionAgreed !== true) return json({ error: 'Agree to the promotional post requirement before submitting.' }, 400)
    if (body.vendorTermsAgreed !== true) return json({ error: 'Review and agree to the vendor terms before submitting.' }, 400)

    const eventCount = marketIds.length
    const selectedEvents = marketIds.map((id) => `${MARKETS[id].name} — ${MARKETS[id].date}`).join(', ')
    const applicationId = randomUUID()
    const submittedAt = new Date().toISOString()
    const application = {
      marketIds,
      selectedEvents,
      spaceSize,
      spaceLabel: space.label,
      spacePrice: space.price,
      eventCount,
      estimatedTotal: space.price * eventCount,
      businessName,
      contactName,
      email,
      phone,
      website,
      instagram,
      businessDescription,
      inventoryPriceRange,
      promotionAgreed: true,
      vendorTermsAgreed: true,
      vendorTermsVersion: VENDOR_TERMS_VERSION,
      vendorTermsAcceptedAt: submittedAt,
      categories,
      photoUrls,
    }
    const backup = { applicationId, submittedAt, status: 'pending', application }
    const backupKey = `applications/${applicationId}`
    let store

    try {
      store = openStore()
      await store.setJSON(backupKey, backup)
    } catch (error) {
      console.error('Vendor application backup failed', error)
      return json({ error: 'We could not submit your application. Please try again.' }, 502)
    }

    try {
      await deliver({
        action: 'submit-application',
        applicationId,
        selectedEvents,
        spaceSize,
        spaceLabel: space.label,
        spacePrice: `$${space.price}`,
        eventCount,
        estimatedTotal: `$${space.price * eventCount}`,
        businessName: sheetSafe(businessName),
        contactName: sheetSafe(contactName),
        email: sheetSafe(email),
        phone: sheetSafe(phone),
        website: sheetSafe(website),
        instagram: sheetSafe(instagram),
        businessDescription: sheetSafe(businessDescription),
        inventoryPriceRange: sheetSafe(inventoryPriceRange),
        promotionAgreed: true,
        vendorTermsAgreed: true,
        vendorTermsVersion: VENDOR_TERMS_VERSION,
        vendorTermsAcceptedAt: submittedAt,
        categories,
        photoUrls,
      })
    } catch (error) {
      console.error('Vendor application submission failed', error)
      return json({ error: 'We could not submit your application. Please try again.' }, 502)
    }

    // The pending record remains recoverable if this status update fails.
    try {
      await store.setJSON(backupKey, {
        ...backup,
        status: 'google-accepted',
        googleAcceptedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Vendor application backup status update failed', applicationId, error)
    }

    return json({ ok: true, applicationId })
  }
}

export default createVendorApplication()

export const config = {
  path: '/api/vendor-application',
}
