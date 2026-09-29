import { useEffect, useState } from 'react'
import { CalendarBlank, Check, DownloadSimple } from '@phosphor-icons/react'
import './ticket.css'

function calendarUrl(event) {
  return event?.id ? `/api/calendar?event=${encodeURIComponent(event.id)}` : ''
}

function ticketImageUrl(token) {
  return token ? `/api/ticket-image?token=${encodeURIComponent(token)}` : ''
}

function CalendarAppIcon({ event }) {
  const parts = String(event?.date || '').split('-')
  const monthIndex = Number(parts[1]) - 1
  const month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][monthIndex] || 'CAL'
  const day = parts[2] ? String(Number(parts[2])) : '•'

  return (
    <span className="calendar-app-icon" aria-hidden="true">
      <small>{month}</small>
      <strong>{day}</strong>
    </span>
  )
}

function CalendarButton({ event, className = '' }) {
  const href = calendarUrl(event)
  if (!href) return null

  return (
    <a className={`calendar-button ${className}`.trim()} href={href}>
      <CalendarAppIcon event={event} />
      <span>ADD TO CALENDAR</span>
    </a>
  )
}

async function downloadTicketPng(token) {
  const source = ticketImageUrl(token)
  if (!source) return

  try {
    const response = await fetch(source, { cache: 'no-store' })
    if (!response.ok) throw new Error('Ticket image unavailable')

    const svgText = await response.text()
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
    const svgObjectUrl = URL.createObjectURL(svgBlob)

    try {
      const image = new Image()
      image.decoding = 'async'
      image.src = svgObjectUrl
      await image.decode()

      const canvas = document.createElement('canvas')
      canvas.width = 900
      canvas.height = 1200
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not prepare ticket image')

      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      const png = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export ticket image')), 'image/png', 1)
      })

      const downloadUrl = URL.createObjectURL(png)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = 'assembly-vintage-ticket.png'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    } finally {
      URL.revokeObjectURL(svgObjectUrl)
    }
  } catch (error) {
    console.error('Ticket download failed', error)
    window.open(source, '_blank', 'noopener,noreferrer')
  }
}

function TicketImage({ token, alt = 'Your Assembly Vintage Market ticket' }) {
  const src = ticketImageUrl(token)
  if (!src) return null
  return <img className="ticket-image" src={src} alt={alt} />
}

function DownloadTicketButton({ token }) {
  if (!token) return null
  return (
    <button className="download-ticket-button" type="button" onClick={() => downloadTicketPng(token)}>
      <DownloadSimple size={20} weight="bold" />
      <span>DOWNLOAD TICKET</span>
    </button>
  )
}

export function TicketConfirmation({ ticket, fallbackEvent, onDone }) {
  const event = ticket?.event || {
    id: fallbackEvent?.id,
    name: 'Assembly Vintage Market',
    displayDate: fallbackEvent?.date,
    venue: fallbackEvent?.venue,
    address: fallbackEvent?.address,
    time: fallbackEvent?.timeDetailed,
  }

  return (
    <div className="ticket-confirmation ticket-confirmation--image">
      <div className="ticket-confirmation__intro">
        <span className="ticket-confirmation__check"><Check size={22} weight="bold" /></span>
        <p className="eyebrow">REGISTRATION COMPLETE</p>
        <h2>You’re in!</h2>
        <p>This is your ticket. Screenshot it or save it now, then present the QR code at the door on market day. Easy.</p>
      </div>

      <div className="ticket-image-wrap">
        <TicketImage token={ticket?.token} />
      </div>

      <div className="ticket-confirmation__actions ticket-confirmation__actions--ticket">
        <DownloadTicketButton token={ticket?.token} />
        <CalendarButton event={event} />
        <button className="secondary-button" type="button" onClick={onDone}>DONE</button>
      </div>
    </div>
  )
}

export function TicketPage({ token }) {
  const [ticket, setTicket] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    const loadTicket = async () => {
      try {
        const response = await fetch(`/api/ticket?token=${encodeURIComponent(token)}`)
        const result = await response.json().catch(() => ({}))
        if (!response.ok || !result.ticket) throw new Error(result.error || 'Ticket not found.')
        if (cancelled) return
        setTicket(result.ticket)
        setStatus('ready')
        document.title = 'Your Ticket | Assembly Vintage Market'
        document.querySelector('meta[name="description"]')?.setAttribute('content', `Assembly Vintage Market ticket for ${result.ticket.event?.displayDate || result.ticket.event?.date || 'an upcoming market'}.`)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    loadTicket()
    return () => { cancelled = true }
  }, [token])

  return (
    <div className="ticket-page">
      <header className="ticket-page__header">
        <a href="/" aria-label="Assembly Vintage Market home"><img src="/assets/assembly-logo-final.png" alt="Assembly Vintage Market" /></a>
      </header>
      <main className="ticket-page__main">
        {status === 'loading' && <div className="ticket-page__state"><p className="eyebrow">ASSEMBLY VINTAGE MARKET</p><h1>Loading your ticket…</h1></div>}
        {status === 'error' && <div className="ticket-page__state"><p className="eyebrow">ASSEMBLY VINTAGE MARKET</p><h1>Ticket not found.</h1><p>Check the ticket link and try again.</p><a href="/">BACK TO ASSEMBLY</a></div>}
        {status === 'ready' && ticket && (
          <div className="ticket-page__content ticket-page__content--image">
            <p className="eyebrow">YOU’RE ON THE LIST</p>
            <h1>YOUR<br /><em>ASSEMBLY TICKET.</em></h1>
            <div className="ticket-image-wrap ticket-image-wrap--page">
              <TicketImage token={token} />
            </div>
            <div className="ticket-page__actions">
              <DownloadTicketButton token={token} />
              <CalendarButton event={ticket.event} />
            </div>
            <div className="ticket-page__save-note">
              <strong>SAVE THIS TICKET</strong>
              <p>Screenshot or download this ticket now and present the QR code at the door on market day. Future you says thanks.</p>
            </div>
          </div>
        )}
      </main>
      <footer className="ticket-page__footer">CURATED IN SOUTH FLORIDA. BUILT FOR GOOD PEOPLE.</footer>
    </div>
  )
}
