import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, UploadSimple } from '@phosphor-icons/react'

const sections = [
  { title: 'Market', description: 'Event details, space size, and your contact information.' },
  { title: 'Your Shop', description: 'Tell us what makes your shop unique and show us your work.' },
  { title: 'Expectations', description: 'Important details and your promotion commitment.' },
  { title: 'Agreement', description: 'Curation notice and vendor terms.' },
]

const categories = ['Vintage clothing', 'Designer resale', 'Accessories', 'Home / objects', 'Other']

function Requirement({ optional = false }) {
  return <span className={optional ? 'vendor-optional' : 'vendor-required'}>{optional ? 'Optional' : 'Required'}</span>
}

export function VendorLookbook({ Modal, markets, spaces, onClose }) {
  const [selectedMarkets, setSelectedMarkets] = useState(['september'])
  const [spaceSize, setSpaceSize] = useState('8x10')
  const [activeSection, setActiveSection] = useState(0)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    const previews = photos.map((photo) => ({ name: photo.name, url: URL.createObjectURL(photo) }))
    setPhotoPreviews(previews)
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [photos])

  const selectedSpace = spaces[spaceSize]
  const total = selectedSpace.price * selectedMarkets.length

  const guardedClose = () => {
    if (submitting) return
    if (!submitted && dirty && !window.confirm('Leave your application? Your answers will be lost.')) return
    onClose()
  }

  const openSection = (index) => {
    setError('')
    setActiveSection(index)
    if (window.innerWidth < 800) {
      window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  const showError = (index, message, name) => {
    setActiveSection(index)
    setError(message)
    window.requestAnimationFrame(() => {
      const control = name && formRef.current?.querySelector(`[name="${name}"]`)
      const target = control || formRef.current
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      control?.focus({ preventScroll: true })
    })
    return false
  }

  const validateSection = (index, data) => {
    const value = (name) => String(data.get(name) || '').trim()
    if (index === 0) {
      if (!selectedMarkets.length) return showError(index, 'Choose at least one market.', 'markets')
      for (const [name, label] of [['business-name', 'business name'], ['contact-name', 'contact name'], ['email', 'email'], ['phone', 'phone number']]) {
        if (!value(name)) return showError(index, `Enter your ${label}.`, name)
      }
      if (!formRef.current.elements.namedItem('email').checkValidity()) return showError(index, 'Enter a valid email address.', 'email')
    }
    if (index === 1) {
      if (!data.getAll('categories').length) return showError(index, 'Choose at least one product category.', 'categories')
      if (!value('business-description')) return showError(index, 'Describe your business and what makes it unique.', 'business-description')
      if (!value('inventory-price-range')) return showError(index, 'Enter the general price range of your inventory.', 'inventory-price-range')
      if (photos.length < 3 || photos.length > 5) return showError(index, 'Choose 3–5 product or booth photos. Three is the minimum.', 'photos')
      const oversizedPhoto = photos.find((photo) => photo.size > 4 * 1024 * 1024)
      if (oversizedPhoto) return showError(index, `${oversizedPhoto.name} is larger than 4 MB. Choose a smaller image.`, 'photos')
      const invalidPhoto = photos.find((photo) => !['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(photo.type) && !/\.(jpe?g|png|heic|heif)$/i.test(photo.name))
      if (invalidPhoto) return showError(index, `${invalidPhoto.name} is not a JPG, PNG or HEIC photo.`, 'photos')
      const website = formRef.current.elements.namedItem('website')
      if (website.value && !website.checkValidity()) return showError(index, 'Enter a valid website address, including https://.', 'website')
    }
    if (index === 2 && data.get('promotion-agreement') !== 'agreed') {
      return showError(index, 'Agree to the promotion commitment to continue.', 'promotion-agreement')
    }
    if (index === 3 && data.get('vendor-terms-agreement') !== 'agreed') {
      return showError(index, 'Read and agree to the Vendor Terms & Conditions to submit.', 'vendor-terms-agreement')
    }
    return true
  }

  const continueToNext = () => {
    const data = new FormData(formRef.current)
    if (!validateSection(activeSection, data)) return
    openSection(activeSection + 1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(formRef.current)
    for (let index = 0; index < sections.length; index += 1) {
      if (!validateSection(index, data)) return
    }

    setSubmitting(true)
    setError('')
    try {
      if (!import.meta.env.DEV) {
        const photoUrls = []
        for (const photo of photos) {
          const uploadData = new FormData()
          uploadData.append('photo', photo)
          const uploadResponse = await fetch('/api/vendor-photo', { method: 'POST', body: uploadData })
          const uploadResult = await uploadResponse.json().catch(() => ({}))
          if (!uploadResponse.ok || !uploadResult.photo?.url) {
            throw new Error(uploadResult.error || `We could not upload ${photo.name}.`)
          }
          photoUrls.push(uploadResult.photo.url)
        }

        const response = await fetch('/api/vendor-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            markets: selectedMarkets,
            spaceSize,
            businessName: data.get('business-name'),
            contactName: data.get('contact-name'),
            email: data.get('email'),
            phone: data.get('phone'),
            website: data.get('website'),
            instagram: data.get('instagram'),
            categories: data.getAll('categories'),
            businessDescription: data.get('business-description'),
            inventoryPriceRange: data.get('inventory-price-range'),
            promotionAgreed: data.get('promotion-agreement') === 'agreed',
            vendorTermsAgreed: data.get('vendor-terms-agreement') === 'agreed',
            photoUrls,
          }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || !result.ok) throw new Error(result.error || 'We could not submit your application.')
      }
      setSubmitted(true)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal label="Assembly Vintage vendor application" onClose={guardedClose}>
      <div className="vendor-lookbook">
        <div className="vendor-lookbook__masthead"><span>ASSEMBLY VINTAGE</span><span>VENDOR APPLICATION</span></div>
        {submitted ? (
          <div className="vendor-lookbook__success" role="status">
            <span className="vendor-lookbook__edition">APPLICATION RECEIVED</span>
            <h2>Thank you.<br />We’ll be in touch.</h2>
            <p>Your application for {selectedMarkets.length} {selectedMarkets.length === 1 ? 'market' : 'markets'} has been submitted for review. Our team will be in touch after curation.</p>
            <button className="primary-button" type="button" onClick={guardedClose}>CLOSE <ArrowRight size={17} /></button>
          </div>
        ) : (
          <div className="vendor-lookbook__layout">
            <aside className="vendor-lookbook__aside">
              <div className="vendor-lookbook__intro">
                <span className="vendor-lookbook__edition">AN INVITATION TO APPLY · 2026</span>
                <h2>Vendor<br />Application</h2>
                <p>We’d love to get to know your shop. We hand-select vendors whose collections fit each market’s aesthetic, style, and audience. That thoughtful mix makes the event better, gives vendors stronger opportunities to connect with shoppers and make sales, and gives our returning audience an experience they know and love.</p>
              </div>
              <div className="vendor-lookbook__collage" aria-label="Indoor vintage market scenes">
                <figure className="vendor-lookbook__polaroid vendor-lookbook__polaroid--one"><img src="/assets/vendor-moment.jpg" alt="Vendor and shoppers browsing clothing inside a market hall" /></figure>
                <figure className="vendor-lookbook__polaroid vendor-lookbook__polaroid--two"><img src="/assets/rack-detail.jpg" alt="Shopper browsing a vintage clothing rack indoors" /></figure>
                <figure className="vendor-lookbook__polaroid vendor-lookbook__polaroid--three"><img src="/assets/market-crowd.jpg" alt="Indoor vintage market filled with shoppers and racks" /></figure>
                <div className="vendor-lookbook__ticket" aria-hidden="true"><span>ASSEMBLY<br />VINTAGE<br />MARKET</span><small>APPLICATION · 2026</small></div>
              </div>
              <nav className="vendor-lookbook__nav" aria-label="Vendor application sections">
                {sections.map((section, index) => (
                  <button key={section.title} type="button" className={`vendor-lookbook__nav-item${activeSection === index ? ' is-active' : ''}`} onClick={() => openSection(index)} aria-current={activeSection === index ? 'step' : undefined} aria-controls={`vendor-section-${index}`}>
                    <em>{String(index + 1).padStart(2, '0')}</em>
                    <span><strong>{section.title}</strong><small>{section.description}</small></span>
                    <ArrowRight size={19} aria-hidden="true" />
                  </button>
                ))}
              </nav>
            </aside>

            <form className="vendor-lookbook__form" name="vendor-application" ref={formRef} onSubmit={handleSubmit} onChange={() => { setError(''); setDirty(true) }} noValidate>
              <div className="vendor-lookbook__progress" aria-label={`Section ${activeSection + 1} of ${sections.length}`}>
                <span>{String(activeSection + 1).padStart(2, '0')} / 04 SECTIONS</span>
                <div aria-hidden="true">{sections.map((section, index) => <i key={section.title} className={index === activeSection ? 'is-filled' : ''} />)}</div>
              </div>

              {error && <p className="vendor-lookbook__error" role="alert">{error}</p>}

              <section id="vendor-section-0" className="vendor-lookbook__section" hidden={activeSection !== 0} aria-labelledby="vendor-section-title-0">
                <div className="vendor-lookbook__section-heading"><span>01</span><div><h3 id="vendor-section-title-0">Market</h3><p>Choose your market dates and tell us how to reach you.</p></div></div>
                <p className="vendor-lookbook__field-note">Every field is labeled Required or Optional.</p>
                <fieldset className="vendor-lookbook__choices">
                  <legend>Events you’re applying for <Requirement /></legend>
                  {markets.map((market) => (
                    <label key={market.id} className="vendor-lookbook__choice"><input type="checkbox" name="markets" value={market.id} checked={selectedMarkets.includes(market.id)} onChange={() => setSelectedMarkets((current) => current.includes(market.id) ? current.filter((id) => id !== market.id) : [...current, market.id])} /><span>{market.name}<small>{market.date}</small></span></label>
                  ))}
                  <small>Select all markets you’d like to join.</small>
                </fieldset>
                <div className="vendor-lookbook__fields">
                  <label className="vendor-lookbook__field">Space size <Requirement /><select name="space-size" value={spaceSize} onChange={(event) => setSpaceSize(event.target.value)} required><option value="8x10">8′ × 10′ — $300</option><option value="6x4">6′ × 4′ — $200</option></select></label>
                  <label className="vendor-lookbook__field">Business / shop name <Requirement /><input name="business-name" placeholder="Your business name" required maxLength={150} /></label>
                  <label className="vendor-lookbook__field">Contact name <Requirement /><input name="contact-name" autoComplete="name" placeholder="Your name" required maxLength={150} /></label>
                  <label className="vendor-lookbook__field">Email <Requirement /><input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                  <label className="vendor-lookbook__field">Phone <Requirement /><input type="tel" name="phone" autoComplete="tel" placeholder="(123) 456-7890" required /></label>
                </div>
              </section>

              <section id="vendor-section-1" className="vendor-lookbook__section" hidden={activeSection !== 1} aria-labelledby="vendor-section-title-1">
                <div className="vendor-lookbook__section-heading"><span>02</span><div><h3 id="vendor-section-title-1">Your Shop</h3><p>Tell us what you sell, what makes you unique, and show us your work.</p></div></div>
                <fieldset className="vendor-lookbook__categories">
                  <legend>What do you sell? <Requirement /></legend>
                  <div>{categories.map((category) => <label key={category}><input type="checkbox" name="categories" value={category} /><span>{category}</span></label>)}</div>
                </fieldset>
                <label className="vendor-lookbook__field">Please describe your business and what makes you unique. <Requirement /><textarea name="business-description" rows="4" placeholder="Tell us about your shop…" required maxLength={2000} /></label>
                <label className="vendor-lookbook__field">What is the general price range of your inventory for this event? <Requirement /><small className="vendor-lookbook__hint">This is a curated luxury vintage market. The minimum price point for items at this event is $75.</small><input name="inventory-price-range" placeholder="For example, $75–$350" required maxLength={200} /></label>
                <div className="vendor-lookbook__photos">
                  <div className="vendor-lookbook__photos-heading"><span>Upload 3–5 product or booth photos <Requirement /></span><strong>{photos.length} / 3 minimum</strong></div>
                  <label className="vendor-lookbook__upload"><input type="file" name="photos" accept="image/jpeg,image/png,image/heic,image/heif" multiple onChange={(event) => setPhotos(Array.from(event.target.files || []))} /><UploadSimple size={26} aria-hidden="true" /><span>Choose photos</span><small>JPG, PNG or HEIC · 3–5 photos · max 4 MB each</small></label>
                  <div className="vendor-lookbook__photo-slots" aria-label={`${photos.length} selected photos`}>
                    {Array.from({ length: Math.max(3, photos.length) }, (_, index) => <div key={index} className={photos[index] ? 'has-photo' : ''}>{photoPreviews[index] && <img src={photoPreviews[index].url} alt={`Selected photo ${index + 1}: ${photos[index].name}`} />}{photos[index] ? <span>{photos[index].name}</span> : <span>PHOTO {String(index + 1).padStart(2, '0')}</span>}</div>)}
                  </div>
                </div>
                <div className="vendor-lookbook__fields">
                  <label className="vendor-lookbook__field">Website <Requirement optional /><input type="url" name="website" placeholder="https://yourwebsite.com" /></label>
                  <label className="vendor-lookbook__field">Instagram <Requirement optional /><input name="instagram" placeholder="@yourshop" /></label>
                </div>
              </section>

              <section id="vendor-section-2" className="vendor-lookbook__section" hidden={activeSection !== 2} aria-labelledby="vendor-section-title-2">
                <div className="vendor-lookbook__section-heading"><span>03</span><div><h3 id="vendor-section-title-2">Expectations</h3><p>A little preparation helps make market day great for everyone.</p></div></div>
                <div className="vendor-lookbook__notice"><span className="vendor-lookbook__notice-label">PROMOTION COMMITMENT</span><p>We handle the venue, production, and overall marketing. Promotion is most successful when vendors are actively involved. Vendors are required to begin posting two (2) weeks prior to the event, posting twice per week for a total of four (4) posts, and tagging @assemblyvintageco. Posts may include Instagram feed posts, reels, or TikTok videos. Stories alone do not count toward the four required posts. Vendors who do not participate in consistent promotion may not be considered for future markets.</p></div>
                <label className="vendor-lookbook__consent"><input type="checkbox" name="promotion-agreement" value="agreed" required /><span>I agree to create at least four (4) promotional posts or reels and tag @assemblyvintageco. <Requirement /></span></label>
                <div className="vendor-lookbook__details"><span className="vendor-lookbook__notice-label">IMPORTANT DETAILS</span><ul><li>Vendors must bring their own tables, racks, and display materials.</li><li>Clothing vendors must bring a mirror.</li><li>Early breakdown is not permitted.</li><li>Vendors are responsible for their merchandise.</li><li>Electricity is not guaranteed unless otherwise specified.</li><li>One fitting room will be provided.</li></ul></div>
              </section>

              <section id="vendor-section-3" className="vendor-lookbook__section" hidden={activeSection !== 3} aria-labelledby="vendor-section-title-3">
                <div className="vendor-lookbook__section-heading"><span>04</span><div><h3 id="vendor-section-title-3">Agreement</h3><p>Please review the selection notice and terms before submitting.</p></div></div>
                <div className="vendor-lookbook__notice"><span className="vendor-lookbook__notice-label">VENDOR SELECTION &amp; CURATION NOTICE</span><p>Submitting an application does not guarantee acceptance. All vendors are subject to curation and approval by Assembly Vintage Market.</p><p>As a new market, we’re still getting to know the space and how best to curate the vendor mix. While we hope to include as many vendors as possible, we may not be able to accommodate everyone this time.</p><p>Please know we plan to host additional markets and would love to stay connected for future events.</p></div>
                <div className="vendor-lookbook__terms"><h4>Assembly Vintage Market – Vendor Agreement <Requirement /></h4><p>Please review the following terms carefully. By submitting your application, you agree to these terms and acknowledge that they are binding.</p><p>By applying to Assembly Vintage Market, I/We confirm that I/We have read and agree to follow all market rules and guidelines. I/We certify that the undersigned is the responsible party for this application.</p><p>I/We agree to hold harmless Assembly Vintage Market, its organizers, partners, venue owners, and team members from any claims, damages, or liabilities related to participation in the market.</p><p>Assembly Vintage Market is a curated event, and vendor selection and placement are at the discretion of the market team. While we do our best to accommodate everyone, specific placement cannot be guaranteed, and adjustments may be made as needed. Vendors who do not comply with market or venue rules may be asked to leave without refund.</p><p>Vendor fees are non-refundable, and events will take place rain or shine.</p><p>Assembly Vintage Market reserves the right to make changes to event details, including location, date, time, or format. If circumstances beyond our control prevent the event from taking place, vendors waive any claims for compensation, and all parties will be released from further obligations.</p><p>Vendors are responsible for securing any required licenses, insurance, and for collecting and paying applicable taxes. Assembly Vintage Market is not responsible for vendor tax or licensing compliance.</p><p>Vendors are responsible for their merchandise and agree that Assembly Vintage Market is not liable for loss, theft, or damage.</p><p>By submitting this application, I/We agree to the terms outlined above.</p></div>
                <label className="vendor-lookbook__consent"><input type="checkbox" name="vendor-terms-agreement" value="agreed" required /><span>I have read and agree to the Assembly Vintage Market Vendor Terms &amp; Conditions. By checking this box, I confirm that I am the responsible party for this application and agree to comply with all market rules, guidelines, and requirements. <Requirement /></span></label>
              </section>

              <div className="vendor-lookbook__footer">
                <div className="vendor-lookbook__fee"><span>ESTIMATED BOOTH FEES</span><strong>${total}</strong><small>{selectedSpace.label} space · {selectedMarkets.length} {selectedMarkets.length === 1 ? 'market' : 'markets'}</small></div>
                <div className="vendor-lookbook__actions">
                  {activeSection > 0 && <button type="button" className="vendor-lookbook__back" onClick={() => openSection(activeSection - 1)} disabled={submitting}><ArrowLeft size={17} /> BACK</button>}
                  {activeSection < 3 ? <button type="button" className="primary-button" onClick={continueToNext}>CONTINUE <ArrowRight size={17} /></button> : <button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'SENDING…' : 'SUBMIT APPLICATION'} {submitting ? <Check size={17} /> : <ArrowRight size={17} />}</button>}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  )
}
