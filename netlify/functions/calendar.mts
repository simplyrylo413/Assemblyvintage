const events = {
  october: {
    id: 'october',
    name: 'Assembly Vintage Market',
    date: 'Sunday, October 25, 2026',
    startISO: '2026-10-25T11:00:00-04:00',
    endISO: '2026-10-25T16:00:00-04:00',
    venue: 'Aloft Delray Beach',
    address: '202 SE 5th Ave, Delray Beach, FL',
  },
  november: {
    id: 'november',
    name: 'Assembly Vintage Market',
    date: 'Sunday, November 15, 2026',
    startISO: '2026-11-15T11:00:00-05:00',
    endISO: '2026-11-15T16:00:00-05:00',
    venue: 'Aloft Delray Beach',
    address: '202 SE 5th Ave, Delray Beach, FL',
  },
} as const

function escapeICS(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function toICSDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.000Z$/, 'Z')
}

export default async (req: Request) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const eventId = new URL(req.url).searchParams.get('event')?.toLowerCase() || ''
  const event = events[eventId as keyof typeof events]
  if (!event) return new Response('Event not found', { status: 404 })

  const location = `${event.venue}, ${event.address}`
  const description = `Assembly Vintage Market at ${event.venue}. Free admission.`

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Assembly Vintage Market//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:assembly-${event.id}@assemblyvintageco.com`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(event.startISO)}`,
    `DTEND:${toICSDate(event.endISO)}`,
    `SUMMARY:${escapeICS(event.name)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    'URL:https://assemblyvintageco.com',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')

  return new Response(calendar, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="assembly-vintage-${event.id}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const config = {
  path: '/api/calendar',
}
