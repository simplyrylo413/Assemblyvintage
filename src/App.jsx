import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CaretDown, Check, List, UploadSimple, X } from '@phosphor-icons/react'
import './styles.css'

const EVENT_DATE = new Date('2026-09-27T11:00:00-04:00')

const vendorMarkets = [
  { id: 'september', name: 'Aloft Hotel Delray Beach', date: 'Sep 27, 2026', location: 'Aloft Hotel Delray Beach' },
  { id: 'october', name: 'Aloft Hotel Delray Beach', date: 'Oct 25, 2026', location: 'Aloft Hotel Delray Beach' },
  { id: 'november', name: 'Aloft Hotel Delray Beach', date: 'Nov 15, 2026', location: 'Aloft Hotel Delray Beach' },
]

const spaceOptions = {
  '8x10': { label: "8′ × 10′", price: 300 },
  '6x4': { label: "6′ × 4′", price: 200 },
}

function useCountdown() {
  const calculate = () => {
    const distance = Math.max(0, EVENT_DATE.getTime() - Date.now())
    return {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance / 3600000) % 24),
      minutes: Math.floor((distance / 60000) % 60),
      seconds: Math.floor((distance / 1000) % 60),
    }
  }
  const [time, setTime] = useState(calculate)
  useEffect(() => {
    const timer = window.setInterval(() => setTime(calculate()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return time
}

function Logo() {
  return <a className="logo" href="#top" aria-label="Assembly home"><img src="/assets/assembly-logo-final.png" alt="Assembly" /></a>
}

function Countdown() {
  const time = useCountdown()
  return (
    <section className="countdown" aria-label="Countdown to the next market">
      <p className="countdown-label">COUNTDOWN TO<br />THE NEXT MARKET</p>
      <div className="countdown-values">
        {Object.entries(time).map(([label, value]) => (
          <div className="time-unit" key={label}><span key={value} className="time-number">{String(value).padStart(2, '0')}</span><span>{label}</span></div>
        ))}
      </div>
      <p className="countdown-note">VINTAGE BRINGS<br />GOOD PEOPLE TOGETHER.</p>
    </section>
  )
}

const pastMarkets = [
  { city: 'DELRAY BEACH', date: 'SEP 2026', image: '/assets/latest-market-poster.jpg' },
  { city: 'MIAMI', date: 'MAY 2026', image: '/assets/market-crowd.jpg' },
  { city: 'PALM BEACH', date: 'FEB 2026', image: '/assets/rack-detail.jpg' },
]

const faqs = {
  shopper: [
    {
      question: 'Do I need a ticket to attend?',
      answer: 'Admission is free, but registration is the best way to get event reminders, first-hour perks, vendor updates, and last-minute details before the market.',
    },
    {
      question: 'What kind of vintage will be there?',
      answer: 'Expect a curated mix of clothing, accessories, designer finds, jewelry, home pieces, and one-off pieces from independent sellers. The feel is more styled destination market than crowded resale table.',
    },
    {
      question: 'Is the event indoors?',
      answer: 'Yes. Assembly markets are indoors, so you can shop comfortably, meet vendors, and make a day of it without worrying about South Florida weather.',
    },
    {
      question: 'Should I bring cash?',
      answer: 'Many vendors accept cards or digital payments, but bringing some cash is smart for faster checkout, small finds, or vendors with limited service inside the venue.',
    },
    {
      question: 'Can I bring friends?',
      answer: 'Absolutely. Assembly is built as a social shopping experience, so bring the people who will tell you when the jacket is a yes.',
    },
  ],
  vendor: [
    {
      question: 'How do I apply to become a vendor?',
      answer: 'Use the vendor application link and include your brand, category, photos of your setup, and examples of the inventory you plan to bring. Curated presentation matters as much as product quality.',
    },
    {
      question: 'What types of vendors are a fit?',
      answer: 'Vintage apparel, accessories, jewelry, designer resale, home objects, records, art, and adjacent lifestyle goods can all fit if the assortment feels intentional and elevated.',
    },
    {
      question: 'What should my booth setup look like?',
      answer: 'Think clean racks, strong merchandising, clear pricing, a polished checkout flow, and enough negative space for people to browse. The goal is a boutique market feel inside an event setting.',
    },
    {
      question: 'How much inventory should I bring?',
      answer: 'Bring enough depth to refresh your rack during the day, but edit tightly. A strong point of view usually performs better than packing every piece you own.',
    },
    {
      question: 'How will vendors be promoted?',
      answer: 'Assembly can feature vendors through event emails, social posts, reels, and market-day content. Clean photos, strong product stories, and quick details help your brand get highlighted.',
    },
  ],
}

function Modal({ children, label, onClose }) {
  useEffect(() => {
    const escape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', escape)
    document.body.classList.add('modal-open')
    return () => { document.removeEventListener('keydown', escape); document.body.classList.remove('modal-open') }
  }, [onClose])
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={22} weight="bold" /></button>
        {children}
      </div>
    </div>
  )
}

function VendorApplication({ onClose }) {
  const [selectedMarkets, setSelectedMarkets] = useState(['september'])
  const [marketMenuOpen, setMarketMenuOpen] = useState(false)
  const [spaceSize, setSpaceSize] = useState('8x10')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const toggleMarket = (marketId) => {
    setSelectedMarkets((current) => current.includes(marketId)
      ? current.filter((id) => id !== marketId)
      : [...current, marketId])
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedMarkets.length) {
      setError('Choose at least one market before submitting.')
      setMarketMenuOpen(true)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.delete('markets')
    selectedMarkets.forEach((marketId) => formData.append('markets', marketId))

    if (!import.meta.env.DEV) {
      const sheetEndpoint = import.meta.env.VITE_VENDOR_APPLICATION_ENDPOINT
      if (!sheetEndpoint) {
        setError('Vendor applications are not connected yet. Please email hello@assemblyvintageco.com while we finish the application sheet.')
        return
      }
      try {
        const response = await fetch(sheetEndpoint, { method: 'POST', body: formData })
        if (!response.ok) throw new Error('Submission failed')
      } catch {
        setError('We could not send the application. Please try again or email hello@assemblyvintageco.com.')
        return
      }
    }

    setSubmitted(true)
  }

  const selectedSpace = spaceOptions[spaceSize]
  const total = selectedSpace.price * selectedMarkets.length

  return (
    <Modal label="Assembly vendor application" onClose={onClose}>
      <div className="vendor-panel">
        <div className="vendor-panel__topline">
          <span>ASSEMBLY VINTAGE · APPLY TO VEND</span>
          <span>APPLICATION</span>
        </div>
        <div className="vendor-panel__progress"><span /></div>

        {submitted ? (
          <div className="vendor-panel__success">
            <span className="vendor-logo-crop" aria-hidden="true"><img src="/assets/assembly-logo-final.png" alt="" /></span>
            <p className="eyebrow">APPLICATION RECEIVED</p>
            <h2>Thank you.<br />We’ll be in touch.</h2>
            <p>Your application for {selectedMarkets.length} {selectedMarkets.length === 1 ? 'market' : 'markets'} has been submitted for review and added to our vendor application sheet.</p>
            <button className="primary-button" type="button" onClick={onClose}>CLOSE <X size={17} /></button>
          </div>
        ) : (
          <form
            className="vendor-form"
            name="vendor-application"
            method="POST"
            data-netlify="true"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="form-name" value="vendor-application" />
            <input type="hidden" name="space-price" value={`$${selectedSpace.price}`} />
            <input type="hidden" name="space-label" value={selectedSpace.label} />
            <input type="hidden" name="event-count" value={selectedMarkets.length} />
            <input type="hidden" name="selected-events" value={vendorMarkets.filter((market) => selectedMarkets.includes(market.id)).map((market) => `${market.name} — ${market.date}`).join(', ')} />
            <input type="hidden" name="estimated-total" value={`$${total}`} />
            <div className="vendor-panel__heading">
              <h2>Tell us about your shop.</h2>
              <p>Share a few details so we can get to know your business.</p>
            </div>

            <div className="vendor-form__grid">
              <div className="vendor-field vendor-field--markets">
                <label id="market-picker-label">Events you’re applying for *</label>
                <button
                  className="market-picker__trigger"
                  type="button"
                  aria-labelledby="market-picker-label"
                  aria-expanded={marketMenuOpen}
                  aria-controls="market-options"
                  onClick={() => setMarketMenuOpen((open) => !open)}
                >
                  <span>{selectedMarkets.length ? `${selectedMarkets.length} ${selectedMarkets.length === 1 ? 'event' : 'events'} selected` : 'Choose events'}</span>
                  <CaretDown size={15} weight="bold" />
                </button>
                {marketMenuOpen && (
                  <div className="market-picker__options" id="market-options">
                    {vendorMarkets.map((market) => (
                      <label key={market.id}>
                        <input type="checkbox" name="markets" value={market.id} checked={selectedMarkets.includes(market.id)} onChange={() => toggleMarket(market.id)} />
                        <span>{market.name} — {market.date}</span>
                      </label>
                    ))}
                  </div>
                )}
                <small>Select all markets you’d like to join.</small>
              </div>

              <label className="vendor-field">Space size *
                <select name="space-size" value={spaceSize} onChange={(event) => setSpaceSize(event.target.value)} required>
                  <option value="8x10">8′ × 10′ — $300</option>
                  <option value="6x4">6′ × 4′ — $200</option>
                </select>
              </label>
              <label className="vendor-field">Business / shop name *<input name="business-name" placeholder="Your business name" required /></label>
              <label className="vendor-field">Contact name *<input name="contact-name" autoComplete="name" placeholder="Your name" required /></label>
              <label className="vendor-field">Email *<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
              <label className="vendor-field">Phone *<input type="tel" name="phone" autoComplete="tel" placeholder="(123) 456-7890" required /></label>
              <label className="vendor-field">Website<input type="url" name="website" placeholder="https://yourwebsite.com" /></label>
              <label className="vendor-field">Instagram<input name="instagram" placeholder="@yourshop" /></label>
            </div>

            <fieldset className="vendor-categories">
              <legend>What do you sell? *</legend>
              {['Vintage clothing', 'Designer resale', 'Accessories', 'Home / objects', 'Other'].map((category) => (
                <label key={category}><input type="checkbox" name="categories" value={category} /><span>{category}</span></label>
              ))}
            </fieldset>

            <label className="vendor-upload">
              <span>Upload 3–5 product or booth photos</span>
              <input type="file" name="photos" accept="image/jpeg,image/png,image/heic" multiple />
              <strong><UploadSimple size={27} /> Drag and drop files here or click to upload</strong>
              <small>JPG, PNG or HEIC. Max 10MB each.</small>
            </label>

            {error && <p className="vendor-form__error" role="alert">{error}</p>}
            <div className="vendor-form__summary">
              <span>Applying for {selectedMarkets.length || 0} {selectedMarkets.length === 1 ? 'event' : 'events'} · {selectedSpace.label} space</span>
              <strong>Estimated booth fees: ${total}</strong>
            </div>
            <div className="vendor-form__actions">
              <button className="secondary-button" type="button" onClick={onClose}><ArrowLeft size={16} /> BACK</button>
              <button className="primary-button" type="submit">SUBMIT APPLICATION <ArrowRight size={17} /></button>
            </div>
            <p className="vendor-form__delivery">Final submissions are added to the Assembly vendor application sheet for review.</p>
          </form>
        )}
      </div>
    </Modal>
  )
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [vendorApplicationOpen, setVendorApplicationOpen] = useState(false)
  const [faqAudience, setFaqAudience] = useState('shopper')
  const [openFaq, setOpenFaq] = useState(0)
  const siteRef = useRef(null)

  useEffect(() => {
    const root = siteRef.current
    if (!root) return undefined
    const nodes = root.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } })
    }, { threshold: 0.14 })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    siteRef.current?.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const changeFaqAudience = (audience) => {
    setFaqAudience(audience)
    setOpenFaq(0)
  }

  const handleRegistration = async (event) => {
    event.preventDefault()
    setRegistrationError('')
    setRegistrationSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      emailMarketingConsent: formData.get('emailMarketingConsent') === 'subscribed',
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Registration failed')
      window.fbq?.('track', 'CompleteRegistration', {
        content_name: 'Assembly at Aloft',
        content_category: 'Event Registration',
        status: 'completed',
      })
      setRegistered(true)
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'We could not complete your registration. Please try again.')
    } finally {
      setRegistrationSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <main className="site-frame" ref={siteRef}>
        <div className="site" id="top">
          <header className="site-header">
            <Logo />
            <nav className="desktop-nav" aria-label="Primary navigation">
              <button className="nav-next" type="button" onClick={() => scrollTo('#next-market')}>NEXT MARKET</button>
              <button type="button" onClick={() => scrollTo('#past-markets')}>PAST MARKETS</button>
              <button type="button" onClick={() => scrollTo('#vendor')}>VENDORS</button>
              <button type="button" onClick={() => scrollTo('#faq')}>FAQ</button>
              <button type="button" onClick={() => scrollTo('#about')}>ABOUT</button>
            </nav>
            <button className="menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><List size={30} /></button>
          </header>
          <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={28} /></button>
            <nav aria-label="Mobile navigation">
              <button type="button" onClick={() => scrollTo('#next-market')}>Next Market</button><button type="button" onClick={() => scrollTo('#past-markets')}>Past Markets</button><button type="button" onClick={() => scrollTo('#vendor')}>Vendors</button><button type="button" onClick={() => scrollTo('#faq')}>FAQ</button><button type="button" onClick={() => scrollTo('#about')}>About</button>
            </nav>
          </div>

          <section className="intro" id="next-market">
            <h1 aria-label="Up next">
              <span className="intro-word" aria-hidden="true">
                <span className="intro-letter" style={{ '--letter-index': 0 }}>U</span>
                <span className="intro-letter" style={{ '--letter-index': 1 }}>P</span>
              </span>
              <span className="intro-word" aria-hidden="true">
                <span className="intro-letter" style={{ '--letter-index': 2 }}>N</span>
                <span className="intro-letter" style={{ '--letter-index': 3 }}>E</span>
                <span className="intro-letter" style={{ '--letter-index': 4 }}>X</span>
                <span className="intro-letter" style={{ '--letter-index': 5 }}>T</span>
              </span>
            </h1>
            <p>CURATED VINTAGE MARKETS.<br />REAL PEOPLE. BRIGHTER TOMORROWS.</p>
          </section>

          <section className="event-system" aria-label="Upcoming event details">
            <div className="event-system__date">
              <div className="event-system__heading">SUNDAY, SEPTEMBER 27, 2026</div>
              <div className="event-system__meta">11 AM – 4 PM</div>
              <div className="event-system__benefits event-system__benefits--two">
                <div className="event-system__benefit">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14l-6 7v7M9 20h8M7 7h10" /></svg>
                  <div><strong>DRINKS ON US</strong><span>FIRST HOUR</span><small>11 AM – 12 PM</small></div>
                </div>
                <div className="event-system__benefit event-system__benefit--divided">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2V8ZM9 9h6M9 12h6M9 15h4" /></svg>
                  <div><strong>FREE ADMISSION</strong><small>ALL DAY</small></div>
                </div>
              </div>
            </div>

            <div className="event-system__venue">
              <div className="event-system__heading">ALOFT HOTEL DELRAY BEACH</div>
              <div className="event-system__meta event-system__location">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <span>DELRAY BEACH, FL</span>
              </div>
              <div className="event-system__benefits">
                <div className="event-system__benefit">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l1-5-3-4H7l-3 4 1 5ZM7 8l1-3h8l1 3M6 17v2M18 17v2" /><circle cx="8" cy="14" r="1" /><circle cx="16" cy="14" r="1" /></svg>
                  <div><strong>FREE PARKING</strong><small>ON SITE</small></div>
                </div>
              </div>
            </div>

            <div className="event-system__market">
              <div className="event-system__heading">THE VINTAGE LINEUP</div>
              <div className="event-system__market-body">
                <div className="event-system__count">
                  <span>25+</span>
                  <svg className="event-system__underline" viewBox="0 0 126 26" aria-hidden="true">
                    <path d="M6 12 C25 8 49 9 70 8 C88 7 105 8 119 7" />
                    <path d="M22 21 C41 16 66 17 98 14" />
                  </svg>
                </div>
                <div className="event-system__seller-copy">
                  <strong>CURATED<br />VINTAGE SELLERS</strong>
                  <span>DESIGNER + ONE-OF-ONE PIECES</span>
                </div>
              </div>
            </div>

            <div className="event-system__cta">
              <button className="primary-button" type="button" onClick={() => setRegisterOpen(true)}>REGISTER FREE <ArrowRight size={17} /></button>
            </div>
          </section>

          <Countdown />
          <section className="hero" data-reveal>
            <img src="/assets/hero-indoor-v2.jpg" alt="Stylish shoppers browsing an elevated indoor vintage market" />
            <div className="hero-caption"><span className="mini-arch" aria-hidden="true" /><p>COME FOR THE VINTAGE.<br />STAY FOR THE PEOPLE.</p></div>
            <button className="hero-register" type="button" onClick={() => setRegisterOpen(true)}>SEP 27 · ALOFT HOTEL DELRAY BEACH <ArrowRight size={17} /></button>
          </section>

          <section className="market-story" id="past-markets" data-reveal>
            <div className="section-heading"><p>THE ASSEMBLY EXPERIENCE</p><h2>Good clothes.<br /><em>Great energy.</em></h2></div>
            <div className="story-copy"><p>More than a market, Assembly is a day out—an indoor gathering of independent vintage sellers, spirited style, and the people who make South Florida interesting.</p></div>
          </section>
          <section className="past-grid" data-reveal>
            {pastMarkets.map((market, index) => (
              <article className={`market-card ${index === 0 ? 'featured' : ''}`} key={market.city}>
                <div className="market-image">
                  <img src={market.image} alt={`${market.city} indoor vintage market`} />
                </div>
                <div><strong>{market.city}</strong><span>{market.date}</span></div>
              </article>
            ))}
          </section>

          <section className="vendor-opportunity" id="vendor" data-reveal>
            <div className="vendor-opportunity__main">
              <div className="vendor-opportunity__intro">
                <span className="vendor-logo-crop" aria-hidden="true"><img src="/assets/assembly-logo-final.png" alt="" /></span>
                <p className="eyebrow">BECOME AN ASSEMBLY VENDOR</p>
                <h2>Application<br />Process With<br />Confidence.</h2>
                <p>One application. Multiple markets. A bigger tomorrow.</p>
                <button className="primary-button" type="button" onClick={() => setVendorApplicationOpen(true)}>APPLY TO VEND <ArrowRight size={17} /></button>
              </div>
              <div className="vendor-opportunity__markets">
                <p className="eyebrow">UPCOMING MARKETS</p>
                {vendorMarkets.map((market) => (
                  <article key={market.id}>
                    <h3>{market.name}</h3>
                    <p>{new Date(`${market.date} 12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </article>
                ))}
              </div>
            </div>
            <ol className="vendor-opportunity__steps">
              <li><span>01</span><p>Choose your events</p></li>
              <li><ArrowRight size={20} aria-hidden="true" /><span>02</span><p>Tell us about your shop</p></li>
              <li><ArrowRight size={20} aria-hidden="true" /><span>03</span><p>Submit for review</p></li>
            </ol>
          </section>
          <section className="faq-section" id="faq" data-reveal>
            <div className="faq-intro">
              <span className="mini-arch" aria-hidden="true" />
              <p className="eyebrow">MARKET QUESTIONS</p>
              <h2>Know before<br />you go.</h2>
              <p>Quick answers for shoppers planning the day and vendors deciding if Assembly is the right room for their brand.</p>
              <div className="faq-toggle" role="tablist" aria-label="FAQ audience">
                <button className={faqAudience === 'shopper' ? 'active' : ''} type="button" role="tab" aria-selected={faqAudience === 'shopper'} onClick={() => changeFaqAudience('shopper')}>For Shoppers</button>
                <button className={faqAudience === 'vendor' ? 'active' : ''} type="button" role="tab" aria-selected={faqAudience === 'vendor'} onClick={() => changeFaqAudience('vendor')}>For Vendors</button>
              </div>
            </div>
            <div className="faq-list" key={faqAudience}>
              {faqs[faqAudience].map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <article className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question} style={{ '--delay': `${index * 70}ms` }}>
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.question}</strong>
                      <CaretDown size={21} weight="bold" />
                    </button>
                    <div className="faq-answer" aria-hidden={!isOpen}>
                      <p>{item.answer}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
          <footer id="about"><Logo /><p>CURATED IN SOUTH FLORIDA.<br />BUILT FOR GOOD PEOPLE.</p><div><a href="#top">INSTAGRAM</a><a href="#top">CONTACT</a><a href="#top">TERMS</a></div><small>© 2026 ASSEMBLY VINTAGE MARKET</small></footer>
        </div>
      </main>

      {registerOpen && (
        <Modal label="Register for Assembly at Aloft" onClose={() => setRegisterOpen(false)}>
          <div className="register-modal"><span className="mini-arch" aria-hidden="true" /><p className="eyebrow">SUNDAY, SEPTEMBER 27 · ALOFT HOTEL DELRAY BEACH</p><h2>{registered ? 'You’re in.' : 'Join us at Aloft.'}</h2>
            {registered ? (
              <div className="success-message"><Check size={23} weight="bold" /> Registration received. Check your inbox if email confirmation is required.</div>
            ) : (
              <form onSubmit={handleRegistration}>
                <label>First name<input name="firstName" autoComplete="given-name" required /></label>
                <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
                <label>Email<input type="email" name="email" autoComplete="email" required /></label>
                {registrationError && <p className="register-error" role="alert">{registrationError}</p>}
                <label className="registration-opt-in"><input type="checkbox" name="emailMarketingConsent" value="subscribed" defaultChecked /><span><strong>Keep me in the vintage loop.</strong> Send me upcoming market announcements, first dibs, and other good vintage news. Unsubscribe anytime.</span></label>
                <button className="primary-button" type="submit" disabled={registrationSubmitting}>
                  {registrationSubmitting ? 'REGISTERING…' : 'REGISTER FREE'} {!registrationSubmitting && <ArrowRight size={17} />}
                </button>
              </form>
            )}
          </div>
        </Modal>
      )}
      {vendorApplicationOpen && <VendorApplication onClose={() => setVendorApplicationOpen(false)} />}
    </div>
  )
}
