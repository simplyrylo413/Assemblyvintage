import { useEffect, useState } from 'react'
import { ArrowRight, CalendarBlank, Check, MapPin } from '@phosphor-icons/react'
import './ticket.css'

function qrImageUrl(ticketUrl) {
  if (!ticketUrl) return ''
  const params = new URLSearchParams({
    text: ticketUrl,
    size: '320',
    margin: '2',
    dark: '111111',
    light: 'ffffff',
    ecLevel: 'M',
    format: 'png',
  })
  return `https://quickchart.io/qr?${params.toString()}`
}

function TicketArtwork({ ticket, compact = false }) {
  const event = ticket?.event || {}

  return (
    <article className={`assembly-ticket ${compact ? 'assembly-ticket--compact' : ''}`} aria-label="Assembly Vintage Market ticket">
      <div className="assembly-ticket__brand">
        <img src="/assets/assembly-logo-final.png" alt="Assembly Vintage Market" />
        <span>FREE ADMISSION</span>
      </div>
      <div className="assembly-ticket__event">
        <p>ASSEMBLY VINTAGE MARKET</p>
        <h2>{event.displayDate || event.date || 'Upcoming market'}</h2>
        {event.time && <span className="assembly-ticket__time">{event.time}</span>}
        {event.venue && <span className="assembly-ticket__venue">{event.venue}</span>}
        {event.address && <small>{event.address}</small>}
      </div>
      <div className="assembly-ticket__footer-line">
        <span>GOOD TASTE HAS A GATHERING PLACE.</span>
      </div>
    </article>
  )
}

export function TicketConfirmation({ ticket, fallbackEvent, onDone }) {
  const event = ticket?.event || {
    name: 'Assembly Vintage Market',
    displayDate: fallbackEvent?.date,
    venue: fallbackEvent?.venue,
    address: fallbackEvent?.address,
    time: fallbackEvent?.timeDetailed,
  }
  const qrUrl = qrImageUrl(ticket?.url)

  return (
    <div className="ticket-confirmation">
      <div className="ticket-confirmation__intro">
        <span className="ticket-confirmation__check"><Check size={22} weight="bold" /></span>
        <p className="eyebrow">REGISTRATION COMPLETE</p>
        <h2>You’re in!</h2>
        <p>Your Assembly ticket is ready. Screenshot it, save the link, or scan the QR code to open the ticket page.</p>
      </div>

      <div className="ticket-confirmation__layout">
        <TicketArtwork ticket={{ ...ticket, event }} compact />
        <div className="ticket-confirmation__qr">
          {qrUrl ? <img src={qrUrl} alt="QR code for your Assembly Vintage ticket" /> : <div className="ticket-confirmation__qr-placeholder" aria-hidden="true" />}
          <strong>SCAN FOR YOUR TICKET</strong>
          <span>The QR opens your unique ticket page.</span>
        </div>
      </div>

      <div className="ticket-confirmation__details">
        <div>
          <CalendarBlank size={25} weight="bold" />
          <span><strong>{event.displayDate || fallbackEvent?.date}</strong><small>{fallbackEvent?.timeDetailed}</small></span>
        </div>
        <div>
          <MapPin size={25} weight="fill" />
          <span><strong>{event.venue || fallbackEvent?.venue}</strong><small>{fallbackEvent?.address}</small></span>
        </div>
      </div>

      <div className="ticket-confirmation__actions">
        {ticket?.walletUrl && <a className="apple-wallet-button" href={ticket.walletUrl}>ADD TO APPLE WALLET</a>}
        {ticket?.url && <a className="primary-button" href={ticket.url} target="_blank" rel="noopener noreferrer">VIEW TICKET <ArrowRight size={17} /></a>}
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
        {status === 'error' && <div className="ticket-page__state"><p className="eyebrow">ASSEMBLY VINTAGE MARKET</p><h1>Ticket not found.</h1><p>Check the QR code or ticket link and try again.</p><a href="/">BACK TO ASSEMBLY</a></div>}
        {status === 'ready' && ticket && (
          <div className="ticket-page__content">
            <p className="eyebrow">YOU’RE ON THE LIST</p>
            <h1>YOUR<br /><em>ASSEMBLY TICKET.</em></h1>
            <TicketArtwork ticket={ticket} />
            {ticket?.walletUrl && <a className="apple-wallet-button ticket-page__wallet" href={ticket.walletUrl}>ADD TO APPLE WALLET</a>}
            <p className="ticket-page__note">Present this screen at the market if requested. This ticket contains no payment information and is tied only to this Assembly event.</p>
          </div>
        )}
      </main>
      <footer className="ticket-page__footer">CURATED IN SOUTH FLORIDA. BUILT FOR GOOD PEOPLE.</footer>
    </div>
  )
}
