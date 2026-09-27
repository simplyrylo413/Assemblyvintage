import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import './postcard-gallery.css'

const photos = [
  { image: '/assets/market-jewelry.jpg', alt: 'Shopper trying on layered vintage jewelry' },
  { image: '/assets/market-browsing.jpg', alt: 'Shopper browsing colorful vintage clothing' },
  { image: '/assets/market-vintage-racks.jpg', alt: 'Shopper exploring a rack of vintage clothes at an indoor market' },
  { image: '/assets/market-friends.jpg', alt: 'Two shoppers together at an indoor vintage market' },
]

const tilts = ['-4deg', '2.5deg', '-2deg', '3deg']
const drops = ['12px', '-6px', '9px', '-3px']

export function PostcardGallery() {
  const [selected, setSelected] = useState(null)
  const [duration, setDuration] = useState(32)
  const stripRef = useRef(null)
  const closeRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return undefined
    const measure = () => setDuration(strip.getBoundingClientRect().width / 42)
    const observer = new ResizeObserver(measure)
    observer.observe(strip)
    measure()
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (selected === null) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        closePhoto()
      }
      if (event.key === 'ArrowLeft') setSelected((index) => (index + photos.length - 1) % photos.length)
      if (event.key === 'ArrowRight') setSelected((index) => (index + 1) % photos.length)
    }
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('modal-open')
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.classList.remove('modal-open')
    }
  }, [selected])

  const closePhoto = () => {
    setSelected(null)
    window.requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }))
  }

  const renderStrip = (duplicate) => (
    <div className="postcard-gallery__set" ref={duplicate ? undefined : stripRef} aria-hidden={duplicate ? 'true' : undefined} key={duplicate ? 'duplicate' : 'first'}>
      {photos.map((photo, index) => (
        <button
          className="postcard-gallery__card"
          type="button"
          key={photo.image}
          tabIndex={duplicate ? -1 : undefined}
          aria-label={`Open gallery photo ${index + 1}: ${photo.alt}`}
          style={{ '--tilt': tilts[index], '--drop': drops[index] }}
          onClick={(event) => { openerRef.current = event.currentTarget; setSelected(index) }}
        >
          <img src={photo.image} alt="" loading={duplicate ? 'lazy' : 'eager'} decoding="async" />
        </button>
      ))}
    </div>
  )

  return <>
    <section className={`postcard-gallery${selected !== null ? ' is-paused' : ''}`} aria-label="Assembly market photo gallery" data-reveal>
      <div className="postcard-gallery__viewport">
        <div className="postcard-gallery__track" style={{ '--scroll-duration': `${duration}s` }}>
          {renderStrip(false)}
          {renderStrip(true)}
        </div>
      </div>
    </section>

    {selected !== null && <div className="postcard-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePhoto() }}>
      <div className="postcard-lightbox__dialog" role="dialog" aria-modal="true" aria-label={`Gallery photo ${selected + 1} of ${photos.length}`}>
        <button className="postcard-lightbox__close" type="button" ref={closeRef} onClick={closePhoto} aria-label="Close photo"><X size={23} weight="bold" /></button>
        <button className="postcard-lightbox__arrow postcard-lightbox__arrow--previous" type="button" onClick={() => setSelected((index) => (index + photos.length - 1) % photos.length)} aria-label="Previous photo"><ArrowLeft size={23} /></button>
        <img src={photos[selected].image} alt={photos[selected].alt} />
        <button className="postcard-lightbox__arrow postcard-lightbox__arrow--next" type="button" onClick={() => setSelected((index) => (index + 1) % photos.length)} aria-label="Next photo"><ArrowRight size={23} /></button>
        <p>ASSEMBLY VINTAGE MARKET <span>{String(selected + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span></p>
      </div>
    </div>}
  </>
}
