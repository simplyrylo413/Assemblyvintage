import { getDeployStore, getStore } from '@netlify/blobs'

declare const Netlify: {
  context?: { deploy?: { context?: string } }
}

const TICKET_STORE = 'assembly-tickets'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': status === 200 ? 'public, max-age=60' : 'no-store',
    },
  })
}

function getTicketStore(req: Request) {
  const host = new URL(req.url).hostname.toLowerCase()
  const isProduction = Netlify.context?.deploy?.context === 'production' || host === 'assemblyvintageco.com' || host === 'www.assemblyvintageco.com'
  if (isProduction) return getStore(TICKET_STORE, { consistency: 'strong' })
  return getDeployStore(TICKET_STORE)
}

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  const token = new URL(req.url).searchParams.get('token')?.trim().toLowerCase() || ''
  if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: 'Ticket not found.' }, 404)

  const store = getTicketStore(req)
  const ticket = await store.get(`tickets/${token}`, { type: 'json' }) as {
    ticketNumber?: number
    eventId?: string
    eventName?: string
    eventDate?: string
    eventDisplayDate?: string
    venue?: string
    address?: string
    time?: string
    issuedAt?: string
  } | null

  if (!ticket?.ticketNumber) return json({ error: 'Ticket not found.' }, 404)

  const eventDefaults: Record<string, { name: string; date: string; displayDate: string; venue: string; address: string; time: string }> = {
    october: {
      name: 'Assembly Vintage Market',
      date: '2026-10-25',
      displayDate: 'Sunday, October 25, 2026',
      venue: 'Aloft Delray Beach',
      address: '202 SE 5th Ave, Delray Beach, FL',
      time: '11:00 AM – 4:00 PM',
    },
    november: {
      name: 'Assembly Vintage Market',
      date: '2026-11-15',
      displayDate: 'Sunday, November 15, 2026',
      venue: 'Aloft Delray Beach',
      address: '202 SE 5th Ave, Delray Beach, FL',
      time: '11:00 AM – 4:00 PM',
    },
  }
  const defaults = ticket.eventId ? eventDefaults[ticket.eventId] : undefined

  return json({
    ticket: {
      event: {
        id: ticket.eventId,
        name: ticket.eventName || defaults?.name,
        date: ticket.eventDate || defaults?.date,
        displayDate: ticket.eventDisplayDate || defaults?.displayDate,
        venue: ticket.venue || defaults?.venue,
        address: ticket.address || defaults?.address,
        time: ticket.time || defaults?.time,
      },
      issuedAt: ticket.issuedAt,
    },
  })
}

export const config = {
  path: '/api/ticket',
}
