import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import './postcard-gallery.css'

const photos = [
  { image: '/assets/market-jewelry.jpg', alt: 'Shopper trying on layered vintage jewelry' },
  { image: '/assets/market-new-2214.jpg', alt: 'Vintage rack with a pink tulle dress and black leather jacket' },
  { image: '/assets/market-new-2192.jpg', alt: 'Colorful vintage rack styled with a yellow designer look' },
  { image: '/assets/market-new-1488.jpg', alt: 'Shopper browsing embellished vintage clothing and accessories' },
  { image: '/assets/market-new-2426.jpg', alt: 'Colorful market guest posing beside vintage clothing displays' },
  { image: '/assets/market-purple-outfit.jpeg', alt: 'Shopper in a purple floral outfit browsing vintage pieces' },
  { image: '/assets/market-pink-coat.jpeg', alt: 'Shoppers looking at a pink vintage coat at the market' },
  { image: '/assets/market-floral-bag.jpeg', alt: 'Shopper with a floral bag browsing colorful vintage dresses' },
  { image: '/assets/market-cream-dresses.jpeg', alt: 'Shopper browsing cream vintage dresses on a rack' },
  { image: '/assets/market-colorful-rack.jpeg', alt: 'Shopper browsing a colorful rack of vintage clothing' },
  { image: '/assets/market-lace-rack.jpeg', alt: 'Shopper browsing vintage clothing beside a lace dress' },
  { image: '/assets/market-sunflower-tote.jpeg', alt: 'Shopper with a sunflower tote browsing vintage clothing' },
]

const tilts = ['-4deg', '2.5deg', '-2deg', '3deg', '-3deg', '2deg', '-2.5deg', '3.5deg', '-1.5deg', '2.5deg', '-3deg', '2deg']
const drops = ['12px', '-6px', '9px', '-3px', '8px', '-5px', '10px', '-6px', '7px', '-4px', '9px', '-5px']

export function PostcardGallery() {
  const [selected, setSelected] = useState(null)
  const [duration, setDuration] = useState(32)
  const stripRef = useRef(null)
  const closeRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return undefined
    const measure = () => setDuration(strip.getBoundingClientRect().width / 48.3)
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
          <img src={photo.image} alt="" loading={duplicate || index > 3 ? 'lazy' : 'eager'} decoding="async" />
        </button>
      ))}
    </div>
  )

  return <>
    <section className="postcard-gallery" aria-label="Assembly market photo gallery" data-reveal>
      <div className="postcard-gallery__viewport">
        <div className="postcard-gallery__track" style={{ '--scroll-duration': `${duration}s`, animationPlayState: selected !== null ? 'paused' : 'running' }}>
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
