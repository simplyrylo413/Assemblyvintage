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
    displayNumber?: string
    eventId?: string
    eventName?: string
    eventDate?: string
    eventDisplayDate?: string
    venue?: string
    issuedAt?: string
  } | null

  if (!ticket?.ticketNumber) return json({ error: 'Ticket not found.' }, 404)

  return json({
    ticket: {
      number: ticket.ticketNumber,
      displayNumber: ticket.displayNumber || String(ticket.ticketNumber).padStart(4, '0'),
      event: {
        id: ticket.eventId,
        name: ticket.eventName,
        date: ticket.eventDate,
        displayDate: ticket.eventDisplayDate,
        venue: ticket.venue,
      },
      issuedAt: ticket.issuedAt,
    },
  })
}

export const config = {
  path: '/api/ticket',
}
