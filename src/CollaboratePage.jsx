import { useEffect } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import './collaborate.css'

const collaborationTypes = [
  {
    label: 'SPACES',
    detail: 'Hotels, restaurants, galleries, developments, event venues, and unexpected places with room for a market.',
  },
  {
    label: 'STORES',
    detail: 'Boutiques, vintage stores, and retail concepts interested in hosting or co-creating an Assembly market moment.',
  },
  {
    label: 'BRANDS',
    detail: 'Select partners that naturally fit the Assembly audience, aesthetic, and market experience.',
  },
  {
    label: 'INFLUENCERS + CREATORS',
    detail: 'People with a relevant audience, strong point of view, and a real connection to vintage, style, or local culture.',
  },
  {
    label: 'OTHER IDEAS',
    detail: 'If it belongs in the world of Assembly but does not fit neatly in a box, we still want to hear it.',
  },
]

const collageCards = [
  { src: '/assets/market-vintage-racks.jpg', label: 'A SPACE?', tilt: '-3.5deg', shift: '0px' },
  { src: '/assets/market-browsing.jpg', label: 'A STORE?', tilt: '2.8deg', shift: '18px' },
  { src: '/assets/market-friends.jpg', label: 'A BRAND?', tilt: '-2deg', shift: '-5px' },
  { src: '/assets/market-jewelry.jpg', label: 'AN AUDIENCE?', tilt: '3.6deg', shift: '24px' },
]

function PitchForm() {
  const submitPitch = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = Object.fromEntries(form.entries())
    const lines = [
      `Name: ${values.name || ''}`,
      `Company / Brand / Store: ${values.company || ''}`,
      `Email: ${values.email || ''}`,
      `Phone: ${values.phone || ''}`,
      `Collaboration type: ${values.type || ''}`,
      `Location: ${values.location || ''}`,
      `Website / Instagram: ${values.website || ''}`,
      `Approximate space size: ${values.space || ''}`,
      `Audience size: ${values.audience || ''}`,
      '',
      'THE IDEA',
      values.idea || '',
    ]

    const subject = encodeURIComponent(`Assembly collaboration pitch — ${values.company || values.name || 'New inquiry'}`)
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:assemblyvintageco@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <form className="collaborate-form" onSubmit={submitPitch}>
      <div className="collaborate-form__grid">
        <label>NAME<input name="name" required /></label>
        <label>COMPANY / BRAND / STORE<input name="company" /></label>
        <label>EMAIL<input type="email" name="email" required /></label>
        <label>PHONE<input type="tel" name="phone" /></label>
        <label>COLLABORATION TYPE
          <select name="type" defaultValue="" required>
            <option value="" disabled>Select one</option>
            <option>Venue / Space</option>
            <option>Store</option>
            <option>Brand</option>
            <option>Influencer / Creator</option>
            <option>Other idea</option>
          </select>
        </label>
        <label>LOCATION · CITY / STATE<input name="location" required /></label>
        <label>WEBSITE / INSTAGRAM<input name="website" /></label>
        <label>APPROXIMATE SPACE SIZE<input name="space" placeholder="If applicable" /></label>
        <label className="collaborate-form__audience">AUDIENCE SIZE<input name="audience" placeholder="If applicable" /></label>
        <label className="collaborate-form__idea">TELL US WHAT YOU’RE THINKING
          <textarea name="idea" required placeholder="What do you bring, what are you imagining, and why do you think Assembly is a fit?" />
        </label>
      </div>
      <button className="collaborate-form__submit" type="submit">SEND YOUR PITCH <ArrowRight size={17} /></button>
      <p className="collaborate-form__note">This opens a pre-filled email to Assembly so your pitch lands directly in our inbox.</p>
    </form>
  )
}

export function CollaboratePage({ SiteHeader, SiteFooter }) {
  useEffect(() => {
    document.title = 'Collaborate | Assembly Vintage Market'
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Pitch a collaboration with Assembly Vintage Market. We are open to venues, stores, brands, influencers, creators, and aligned ideas.')
  }, [])

  return (
    <div className="app-shell">
      <main className="site-frame">
        <div className="site collaborate-page" id="top">
          <SiteHeader homeHref="/" onNavigate={(id) => { window.location.href = id.startsWith('/') ? id : `/${id}` }} />

          <section className="collaborate-collage" aria-labelledby="collaborate-title">
            <div className="collaborate-collage__stage">
              <div className="collaborate-polaroid collaborate-polaroid--one" style={{ '--tilt': collageCards[0].tilt, '--shift': collageCards[0].shift }}>
                <span className="collaborate-tape" aria-hidden="true" />
                <img src={collageCards[0].src} alt="Vintage clothing racks at an Assembly market" />
                <strong>{collageCards[0].label}</strong>
              </div>
              <div className="collaborate-polaroid collaborate-polaroid--two" style={{ '--tilt': collageCards[1].tilt, '--shift': collageCards[1].shift }}>
                <span className="collaborate-tape" aria-hidden="true" />
                <img src={collageCards[1].src} alt="Shopper browsing vintage clothing at an Assembly market" />
                <strong>{collageCards[1].label}</strong>
              </div>
              <div className="collaborate-note collaborate-note--hero">
                <span>HAVE A SPACE?</span>
                <span>A STORE?</span>
                <span>A BRAND?</span>
                <span>AN IDEA?</span>
                <em>LET'S TALK.</em>
              </div>
              <div className="collaborate-polaroid collaborate-polaroid--three" style={{ '--tilt': collageCards[2].tilt, '--shift': collageCards[2].shift }}>
                <span className="collaborate-tape" aria-hidden="true" />
                <img src={collageCards[2].src} alt="Friends shopping together at an Assembly vintage market" />
                <strong>{collageCards[2].label}</strong>
              </div>
              <div className="collaborate-polaroid collaborate-polaroid--four" style={{ '--tilt': collageCards[3].tilt, '--shift': collageCards[3].shift }}>
                <span className="collaborate-tape" aria-hidden="true" />
                <img src={collageCards[3].src} alt="Vintage jewelry at an Assembly market" />
                <strong>{collageCards[3].label}</strong>
              </div>
              <div className="collaborate-note collaborate-note--market">
                <span>WE BRING</span>
                <strong>THE MARKET.</strong>
                <span>YOU BRING</span>
                <strong>THE OPPORTUNITY.</strong>
              </div>
            </div>

            <div className="collaborate-collage__intro">
              <p className="eyebrow">COLLABORATE WITH ASSEMBLY</p>
              <h1 id="collaborate-title">LET’S<br /><em>COLLABORATE.</em></h1>
              <p>Assembly is a curated vintage market. We’re always interested in hearing from spaces, stores, brands, influencers, creators, and people with an idea that could make sense in the world of Assembly.</p>
              <a className="collaborate-black-cta" href="#pitch">PITCH US YOUR IDEA <ArrowRight size={17} /></a>
              <div className="collaborate-collage__keywords" aria-label="Collaboration types">
                <span>SPACES</span><span>STORES</span><span>BRANDS</span><span>INFLUENCERS</span><span>IDEAS</span><span>GOOD PEOPLE</span>
              </div>
            </div>
          </section>

          <section className="collaborate-bring" aria-labelledby="bring-heading">
            <p className="eyebrow">WHAT WE BRING</p>
            <div className="collaborate-bring__heading">
              <h2 id="bring-heading">OUR MARKET.<br /><em>YOUR OPPORTUNITY.</em></h2>
              <p>We know what Assembly brings to the table. If you have the right place, audience, brand, store, or idea, tell us what you bring.</p>
            </div>
            <div className="collaborate-bring__grid">
              <article><span>01</span><h3>A CURATED MARKET</h3><p>A hand-selected vintage lineup with a clear point of view and standards that keep the experience intentional.</p></article>
              <article><span>02</span><h3>AN ENGAGED AUDIENCE</h3><p>A style-driven community that comes to discover, shop, meet people, and spend time in the places we activate.</p></article>
              <article><span>03</span><h3>A DISTINCT EXPERIENCE</h3><p>Assembly has a recognizable look, feel, vendor mix, and atmosphere — not a generic vendor fair.</p></article>
              <article><span>04</span><h3>MARKETING + CONTENT</h3><p>Promotion around the market plus social-ready moments that give people a reason to share where they are.</p></article>
            </div>
          </section>

          <section className="collaborate-types" aria-labelledby="types-heading">
            <div className="collaborate-types__visual">
              <img src="/assets/hero-indoor-v2.jpg" alt="Assembly Vintage market inside a bright venue" />
            </div>
            <div className="collaborate-types__content">
              <p className="eyebrow">WHO SHOULD REACH OUT</p>
              <h2 id="types-heading">IF YOU SEE<br />A FIT, <em>PITCH IT.</em></h2>
              <div className="collaborate-types__list">
                {collaborationTypes.map((item, index) => (
                  <article key={item.label}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><h3>{item.label}</h3><p>{item.detail}</p></div>
                    <ArrowRight size={20} aria-hidden="true" />
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="collaborate-banner">
            <img src="/assets/market-colorful-rack.jpeg" alt="Colorful vintage clothing at an Assembly market" />
            <div>
              <p>GOOD IDEAS<br />BELONG<br /><em>TOGETHER.</em></p>
              <span>SPACE × STORE × BRAND × CREATOR × ASSEMBLY</span>
            </div>
          </section>

          <section className="collaborate-pitch" id="pitch" aria-labelledby="pitch-heading">
            <div className="collaborate-pitch__intro">
              <p className="eyebrow">YOUR TURN</p>
              <h2 id="pitch-heading">TELL US WHAT<br />YOU’RE <em>THINKING.</em></h2>
              <p>Have a venue? Own a store? Represent a brand? Have an audience that fits? Or have an idea we haven’t thought of? Give us enough to understand the opportunity and why Assembly belongs in it.</p>
              <div className="collaborate-pitch__note">
                <span>WE KNOW WHAT WE BRING.</span>
                <strong>NOW TELL US<br />WHAT YOU BRING.</strong>
              </div>
            </div>
            <PitchForm />
          </section>

          <SiteFooter homeHref="/" />
        </div>
      </main>
    </div>
  )
}
