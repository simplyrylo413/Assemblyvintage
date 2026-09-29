import { getDeployStore, getStore } from '@netlify/blobs'

declare const Netlify: {
  context?: { deploy?: { context?: string } }
}

const TICKET_STORE = 'assembly-tickets'

function getTicketStore(req: Request) {
  const host = new URL(req.url).hostname.toLowerCase()
  const isProduction = Netlify.context?.deploy?.context === 'production' || host === 'assemblyvintageco.com' || host === 'www.assemblyvintageco.com'
  if (isProduction) return getStore(TICKET_STORE, { consistency: 'strong' })
  return getDeployStore(TICKET_STORE)
}

function escapeXml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function imageDataUrl(bytes: ArrayBuffer, contentType: string) {
  return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`
}

function eventDefaults(eventId?: string) {
  const events: Record<string, { name: string; date: string; displayDate: string; venue: string; address: string; time: string }> = {
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
  return eventId ? events[eventId] : undefined
}

function splitDate(displayDate: string) {
  const parts = displayDate.match(/^(.*?\d{1,2}),\s*(\d{4})$/)
  if (!parts) return [displayDate, '']
  return [parts[1] + ',', parts[2]]
}

export default async (req: Request) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const url = new URL(req.url)
  const token = url.searchParams.get('token')?.trim().toLowerCase() || ''
  if (!/^[a-f0-9]{32}$/.test(token)) return new Response('Ticket not found', { status: 404 })

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
  } | null

  if (!ticket?.ticketNumber) return new Response('Ticket not found', { status: 404 })

  const defaults = eventDefaults(ticket.eventId)
  const event = {
    id: ticket.eventId || '',
    name: ticket.eventName || defaults?.name || 'Assembly Vintage Market',
    date: ticket.eventDate || defaults?.date || '',
    displayDate: ticket.eventDisplayDate || defaults?.displayDate || '',
    venue: ticket.venue || defaults?.venue || '',
    address: ticket.address || defaults?.address || '',
    time: ticket.time || defaults?.time || '',
  }

  const origin = url.origin
  const ticketUrl = `${origin}/ticket/${token}`
  const qrEndpoint = new URL('https://quickchart.io/qr')
  qrEndpoint.searchParams.set('text', ticketUrl)
  qrEndpoint.searchParams.set('size', '420')
  qrEndpoint.searchParams.set('margin', '1')
  qrEndpoint.searchParams.set('dark', '111111')
  qrEndpoint.searchParams.set('light', 'ffffff')
  qrEndpoint.searchParams.set('ecLevel', 'M')
  qrEndpoint.searchParams.set('format', 'png')

  let qrData = ''
  let logoData = ''

  try {
    const [qrResponse, logoResponse] = await Promise.all([
      fetch(qrEndpoint),
      fetch(`${origin}/assets/assembly-logo-final.png`),
    ])

    if (!qrResponse.ok) throw new Error('QR generation failed')
    if (!logoResponse.ok) throw new Error('Logo fetch failed')

    qrData = imageDataUrl(await qrResponse.arrayBuffer(), qrResponse.headers.get('content-type') || 'image/png')
    logoData = imageDataUrl(await logoResponse.arrayBuffer(), logoResponse.headers.get('content-type') || 'image/png')
  } catch (error) {
    console.error('Ticket image asset generation failed', error)
    return new Response('Could not create ticket image', { status: 502 })
  }

  const [dateLine1, dateLine2] = splitDate(event.displayDate)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <rect width="900" height="1200" fill="#f9f8f4"/>
    <rect x="28" y="28" width="844" height="1144" rx="0" fill="#f9f8f4" stroke="#111111" stroke-width="4"/>

    <circle cx="28" cy="565" r="34" fill="#c0dceb" stroke="#111111" stroke-width="4"/>
    <circle cx="872" cy="565" r="34" fill="#c0dceb" stroke="#111111" stroke-width="4"/>

    <text x="76" y="88" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" letter-spacing="4">YOUR TICKET</text>
    <text x="746" y="88" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="3" text-anchor="end">FREE ADMISSION</text>
    <text x="746" y="118" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="2" text-anchor="end">TICKET NO. ${String(ticket.ticketNumber).padStart(4, '0')}</text>

    <image href="${logoData}" x="225" y="125" width="450" height="205" preserveAspectRatio="xMidYMid meet"/>

    <line x1="110" y1="350" x2="790" y2="350" stroke="#111111" stroke-width="2"/>

    <text x="110" y="410" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="4">ASSEMBLY VINTAGE MARKET</text>

    <text x="110" y="490" fill="#111111" font-family="Georgia, 'Times New Roman', serif" font-size="69" letter-spacing="-3">${escapeXml(dateLine1)}</text>
    <text x="110" y="560" fill="#111111" font-family="Georgia, 'Times New Roman', serif" font-size="69" letter-spacing="-3">${escapeXml(dateLine2)}</text>

    <text x="110" y="620" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="2">${escapeXml(event.time)}</text>
    <text x="110" y="662" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" letter-spacing="2">${escapeXml(event.venue.toUpperCase())}</text>
    <text x="110" y="697" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="18">${escapeXml(event.address)}</text>

    <line x1="110" y1="740" x2="790" y2="740" stroke="#111111" stroke-width="2" stroke-dasharray="8 8"/>

    <rect x="110" y="785" width="270" height="270" fill="#ffffff" stroke="#111111" stroke-width="3"/>
    <image href="${qrData}" x="124" y="799" width="242" height="242" preserveAspectRatio="xMidYMid meet"/>

    <text x="420" y="825" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="3">SAVE THIS FOR MARKET DAY</text>
    <text x="420" y="875" fill="#111111" font-family="Georgia, 'Times New Roman', serif" font-size="27">
      <tspan x="420" dy="0">Screenshot or save this ticket now</tspan>
      <tspan x="420" dy="36">and present the QR code at the door.</tspan>
    </text>
    <text x="420" y="980" fill="#111111" font-family="Georgia, 'Times New Roman', serif" font-size="29" font-style="italic">Future you says thanks.</text>

    <text x="110" y="1120" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="3">GOOD TASTE HAS A GATHERING PLACE.</text>
    <text x="790" y="1120" fill="#111111" font-family="Georgia, 'Times New Roman', serif" font-size="23" font-style="italic" text-anchor="end">See you there.</text>
  </svg>`

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'private, max-age=300',
      'Content-Disposition': 'inline; filename="assembly-vintage-ticket.svg"',
    },
  })
}

export const config = {
  path: '/api/ticket-image',
}
