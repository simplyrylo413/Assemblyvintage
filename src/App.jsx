import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CaretDown, Check, List, X } from '@phosphor-icons/react'
import './styles.css'

const EVENT_DATE = new Date('2026-09-27T11:00:00-04:00')

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

export function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
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

  return (
    <div className="app-shell">
      <main className="site-frame" ref={siteRef}>
        <div className="site" id="top">
          <header className="site-header">
            <Logo />
            <nav className="desktop-nav" aria-label="Primary navigation">
              <button className="nav-next" type="button" onClick={() => scrollTo('#next-market')}>NEXT: DELRAY BEACH<br />SEP 27, 2026</button>
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
            <h1><span>UP</span> <span>NEXT</span></h1>
            <p>CURATED VINTAGE MARKETS.<br />REAL PEOPLE. BRIGHTER TOMORROWS.</p>
          </section>
          <section className="event-strip" aria-label="Upcoming event details">
            <div><span>NEXT MARKET</span><strong>ASSEMBLY AT ALOFT</strong></div>
            <div><span>WHEN</span><strong>SUNDAY, SEPTEMBER 27, 2026</strong></div>
            <div><span>WHERE</span><strong>ALOFT DELRAY BEACH</strong><small>11 AM – 4 PM · FREE ADMISSION</small></div>
            <button className="primary-button" type="button" onClick={() => setRegisterOpen(true)}>REGISTER FREE <ArrowRight size={17} /></button>
          </section>
          <Countdown />
          <section className="hero" data-reveal>
            <img src="/assets/hero-indoor-v2.jpg" alt="Stylish shoppers browsing an elevated indoor vintage market" />
            <div className="hero-caption"><span className="mini-arch" aria-hidden="true" /><p>COME FOR THE VINTAGE.<br />STAY FOR THE PEOPLE.</p></div>
            <button className="hero-register" type="button" onClick={() => setRegisterOpen(true)}>SEP 27 · DELRAY BEACH <ArrowRight size={17} /></button>
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

          <section className="actions" data-reveal>
            <div className="newsletter">
              <span className="mini-arch" aria-hidden="true" /><p className="eyebrow">NEVER MISS A MARKET</p><h2>Get the next one<br />in your inbox.</h2><p>Event announcements, first access, and market stories. No clutter.</p>
              {subscribed ? <div className="success-message"><Check size={23} weight="bold" /> You’re on the list. See you at the market.</div> : (
                <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true) }}>
                  <label>First name<input name="firstName" autoComplete="given-name" placeholder="First name" required /></label>
                  <label>Last name<input name="lastName" autoComplete="family-name" placeholder="Last name" required /></label>
                  <label className="email-field">Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                  <button className="primary-button" type="submit">SIGN ME UP <ArrowRight size={17} /></button>
                </form>
              )}
            </div>
            <div className="vendor-callout" id="vendor">
              <img src="/assets/vendor-moment.jpg" alt="A vintage vendor helping stylish shoppers indoors" />
              <div><p className="eyebrow">SELL WITH ASSEMBLY</p><h2>Your rack belongs here.</h2><p>Applications are open for independent vintage sellers and collectors.</p><button type="button">APPLY TO BE A VENDOR <ArrowRight size={17} /></button></div>
            </div>
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
          <div className="register-modal"><span className="mini-arch" aria-hidden="true" /><p className="eyebrow">SUNDAY, SEPTEMBER 27 · DELRAY BEACH</p><h2>{registered ? 'You’re in.' : 'Join us at Aloft.'}</h2>
            {registered ? <div className="success-message"><Check size={23} weight="bold" /> Your free registration is confirmed.</div> : <form onSubmit={(event) => { event.preventDefault(); setRegistered(true) }}><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label><label>Email<input type="email" name="email" autoComplete="email" required /></label><button className="primary-button" type="submit">REGISTER FREE <ArrowRight size={17} /></button></form>}
          </div>
        </Modal>
      )}
    </div>
  )
}
