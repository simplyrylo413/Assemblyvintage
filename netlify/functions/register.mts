import { getDeployStore, getStore } from '@netlify/blobs'

declare const Netlify: {
  env: { get(name: string): string | undefined }
  context?: { deploy?: { context?: string } }
}

const KLAVIYO_REVISION = '2026-07-15'
const KLAVIYO_API = 'https://a.klaviyo.com'
const MEDIA_CONSENT_VERSION = '2026-09-27'
const TICKET_STORE = 'assembly-tickets'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function clean(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function getTicketStore(req: Request) {
  const host = new URL(req.url).hostname.toLowerCase()
  const isProduction = Netlify.context?.deploy?.context === 'production' || host === 'assemblyvintageco.com' || host === 'www.assemblyvintageco.com'
  if (isProduction) return getStore(TICKET_STORE, { consistency: 'strong' })
  return getDeployStore(TICKET_STORE)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function hashEmail(email: string) {
  const data = new TextEncoder().encode(email)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function acquireEventLock(store: ReturnType<typeof getStore>, eventId: string) {
  const lockKey = `locks/${eventId}`
  const token = crypto.randomUUID()

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const now = Date.now()
    const current = await store.get(lockKey, { type: 'json' }) as { token?: string; expiresAt?: number } | null

    if (current?.expiresAt && current.expiresAt > now) {
      await sleep(35 + Math.floor(Math.random() * 85))
      continue
    }

    await store.setJSON(lockKey, { token, expiresAt: now + 5000 })
    await sleep(55 + Math.floor(Math.random() * 45))

    const confirmed = await store.get(lockKey, { type: 'json' }) as { token?: string } | null
    if (confirmed?.token === token) return token

    await sleep(30 + Math.floor(Math.random() * 70))
  }

  throw new Error('Could not reserve ticket number')
}

async function releaseEventLock(store: ReturnType<typeof getStore>, eventId: string, token: string) {
  const lockKey = `locks/${eventId}`
  const current = await store.get(lockKey, { type: 'json' }) as { token?: string } | null
  if (current?.token === token) await store.delete(lockKey)
}

type EventInfo = {
  name: string
  date: string
  displayDate: string
  venue: string
}

async function allocateTicket(req: Request, eventId: string, event: EventInfo, email: string) {
  const store = getTicketStore(req)
  const emailHash = await hashEmail(email)
  const registrationKey = `registrations/${eventId}/${emailHash}`

  const existing = await store.get(registrationKey, { type: 'json' }) as { token?: string } | null
  if (existing?.token) {
    const existingTicket = await store.get(`tickets/${existing.token}`, { type: 'json' })
    if (existingTicket) return existingTicket as Record<string, unknown>
  }

  const lockToken = await acquireEventLock(store as ReturnType<typeof getStore>, eventId)

  try {
    const recheck = await store.get(registrationKey, { type: 'json' }) as { token?: string } | null
    if (recheck?.token) {
      const existingTicket = await store.get(`tickets/${recheck.token}`, { type: 'json' })
      if (existingTicket) return existingTicket as Record<string, unknown>
    }

    const counterKey = `counters/${eventId}`
    const counter = await store.get(counterKey, { type: 'json' }) as { value?: number } | null
    const ticketNumber = Math.max(0, Number(counter?.value || 0)) + 1
    const ticketToken = crypto.randomUUID().replace(/-/g, '')
    const issuedAt = new Date().toISOString()

    const ticket = {
      token: ticketToken,
      ticketNumber,
      displayNumber: String(ticketNumber).padStart(4, '0'),
      eventId,
      eventName: event.name,
      eventDate: event.date,
      eventDisplayDate: event.displayDate,
      venue: event.venue,
      issuedAt,
    }

    // Advance the counter before persisting the ticket so a failed write can create
    // a harmless gap, but can never issue the same sequential number twice.
    await store.setJSON(counterKey, { value: ticketNumber })
    await store.setJSON(`tickets/${ticketToken}`, ticket)
    await store.setJSON(registrationKey, { token: ticketToken, ticketNumber })

    return ticket
  } finally {
    await releaseEventLock(store as ReturnType<typeof getStore>, eventId, lockToken)
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const apiKey = Netlify.env.get('KLAVIYO_PRIVATE_API_KEY')
  const listId = Netlify.env.get('KLAVIYO_LIST_ID')
  if (!apiKey || !listId) {
    console.error('Klaviyo environment variables are missing')
    return json({ error: 'Registration is temporarily unavailable. Please try again shortly.' }, 503)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid registration request.' }, 400)
  }

  const firstName = clean(body.firstName, 80)
  const lastName = clean(body.lastName, 80)
  const email = clean(body.email, 254).toLowerCase()
  const emailMarketingConsent = body.emailMarketingConsent === true
  const mediaConsent = body.mediaConsent === true
  const eventId = clean(body.eventId, 40)

  const events: Record<string, EventInfo> = {
    october: {
      name: 'Assembly Vintage Market',
      date: '2026-10-25',
      displayDate: 'Sunday, October 25, 2026',
      venue: 'Aloft Delray Beach',
    },
    november: {
      name: 'Assembly Vintage Market',
      date: '2026-11-15',
      displayDate: 'Sunday, November 15, 2026',
      venue: 'Aloft Delray Beach',
    },
  }
  const event = events[eventId]

  if (!event) return json({ error: 'Choose an upcoming market to register.' }, 400)

  if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid first name, last name, and email address.' }, 400)
  }
  if (!mediaConsent) {
    return json({ error: 'Photo and video consent is required to register for this event.' }, 400)
  }

  const headers = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    revision: KLAVIYO_REVISION,
  }

  const submittedAt = new Date().toISOString()

  const profileResponse = await fetch(`${KLAVIYO_API}/api/profile-import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: firstName,
          last_name: lastName,
          properties: {
            'Registration Source': 'Assembly Website',
            'Registration Event': event.name,
            'Registration Event Date': event.date,
            'Registration Venue': event.venue,
            'Registration Submitted At': submittedAt,
            'Email Marketing Consent': emailMarketingConsent,
            'Event Photo Video Consent': true,
            'Event Photo Video Consent Version': MEDIA_CONSENT_VERSION,
            'Event Photo Video Consent At': submittedAt,
          },
        },
      },
    }),
  })

  if (!profileResponse.ok) {
    const detail = await profileResponse.text()
    console.error('Klaviyo profile upsert failed', profileResponse.status, detail)
    return json({ error: 'We could not complete your registration. Please try again.' }, 502)
  }

  if (emailMarketingConsent) {
    const subscribeResponse = await fetch(`${KLAVIYO_API}/api/profile-subscription-bulk-create-jobs/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: 'SUBSCRIBED',
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: listId,
              },
            },
          },
        },
      }),
    })

    if (!subscribeResponse.ok) {
      const detail = await subscribeResponse.text()
      console.error('Klaviyo subscription failed', subscribeResponse.status, detail)
      return json({ error: 'We could not complete your registration. Please try again.' }, 502)
    }
  }

  let ticket: Record<string, unknown>
  try {
    ticket = await allocateTicket(req, eventId, event, email)
  } catch (error) {
    console.error('Ticket allocation failed', error)
    return json({ error: 'Your registration was received, but we could not create your ticket. Please try again.' }, 503)
  }

  const ticketUrl = new URL(`/ticket/${ticket.token}`, req.url).toString()

  // Best-effort: attach the generated ticket details to the Klaviyo profile.
  const ticketProfileResponse = await fetch(`${KLAVIYO_API}/api/profile-import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email,
          properties: {
            'Assembly Ticket Number': ticket.ticketNumber,
            'Assembly Ticket Display Number': ticket.displayNumber,
            'Assembly Ticket URL': ticketUrl,
          },
        },
      },
    }),
  })

  if (!ticketProfileResponse.ok) {
    console.error('Klaviyo ticket property update failed', ticketProfileResponse.status, await ticketProfileResponse.text())
  }

  return json({
    ok: true,
    ticket: {
      number: ticket.ticketNumber,
      displayNumber: ticket.displayNumber,
      token: ticket.token,
      url: ticketUrl,
      event: {
        id: eventId,
        name: event.name,
        date: event.date,
        displayDate: event.displayDate,
        venue: event.venue,
      },
    },
  })
}

export const config = {
  path: '/api/register',
}
