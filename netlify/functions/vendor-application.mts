import { clean, json, sendToGoogle } from './_shared/vendor-google.mts'

const MARKETS: Record<string, { name: string; date: string }> = {
  aloft: { name: 'Assembly at Aloft', date: 'Sep 27, 2026' },
  'palm-beach': { name: 'Assembly Palm Beach', date: 'Nov 8, 2026' },
  miami: { name: 'Assembly Miami', date: 'Dec 6, 2026' },
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

export default async (req: Request) => {
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
  if (photoUrls.length < 3) return json({ error: 'Upload at least three product or booth photos.' }, 400)

  const eventCount = marketIds.length
  const selectedEvents = marketIds.map((id) => `${MARKETS[id].name} — ${MARKETS[id].date}`).join(', ')

  try {
    await sendToGoogle({
      action: 'submit-application',
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
      categories,
      photoUrls,
    })

    return json({ ok: true })
  } catch (error) {
    console.error('Vendor application submission failed', error)
    return json({ error: 'We could not submit your application. Please try again.' }, 502)
  }
}

export const config = {
  path: '/api/vendor-application',
}
