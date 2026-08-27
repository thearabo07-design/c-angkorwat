import { useEffect, useState } from 'react'
import heroImage from './assets/hero.png'
import sunriseImage from './assets/angkor-sunrise-optimized.jpg'
import './App.css'

const heritageStories = [
  { number: '01', title: 'History', text: 'Raised in the early 12th century, Angkor Wat remains a profound expression of Khmer devotion, vision, and craft.' },
  { number: '02', title: 'Architecture', text: 'Five lotus-bud towers, galleries of stone reliefs, and a vast moat create a temple designed as a sacred universe.' },
  { number: '03', title: 'Living Culture', text: 'Angkor is more than a monument: it is a place of worship, memory, and enduring Cambodian identity.' },
]

const gallery = [
  { title: 'Angkor at first light', detail: 'A temple shaped by dawn', image: sunriseImage, className: 'gallery-temple' },
  { title: 'Stories in stone', detail: 'Devotion in every detail', image: heroImage, className: 'gallery-carving' },
  { title: 'Sacred reflections', detail: 'Still water, open sky', image: sunriseImage, className: 'gallery-water' },
  { title: 'The forest remembers', detail: 'Nature surrounding heritage', image: sunriseImage, className: 'gallery-forest' },
]

function TempleMark() { return <span className="temple-mark" aria-hidden="true">☼</span> }

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<(typeof gallery)[number] | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const showButton = () => setShowBackToTop(window.scrollY > 550)
    window.addEventListener('scroll', showButton, { passive: true })
    return () => window.removeEventListener('scroll', showButton)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return <main>
    <section className="hero" id="home">
      <img className="hero-image" src={sunriseImage} alt="Angkor Wat at sunrise" />
      <div className="hero-overlay" />
      <header className="site-header">
        <a className="brand" href="#home" aria-label="C Angkorwat home"><TempleMark /><span>C Angkorwat</span></a>
        <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation"><span /><span /><span /><span className="sr-only">Open menu</span></button>
        <nav id="main-navigation" className={menuOpen ? 'open' : ''} aria-label="Main navigation"><a onClick={closeMenu} href="#home">Home</a><a onClick={closeMenu} href="#history">History</a><a onClick={closeMenu} href="#explore">Explore</a><a onClick={closeMenu} href="#gallery">Gallery</a><a onClick={closeMenu} href="#visit">Visit</a><a onClick={closeMenu} href="#contact">Contact</a></nav>
      </header>
      <div className="hero-content reveal"><p className="eyebrow">A Khmer heritage journal</p><h1>Where stone<br />holds memory.</h1><p className="hero-copy">Enter the world of Angkor Wat—an enduring wonder shaped by faith, artistry, and the spirit of Cambodia.</p><a className="button button-gold" href="#explore">Explore the heritage <span aria-hidden="true">↘</span></a></div>
      <a className="scroll-cue" href="#history">Scroll to discover <span aria-hidden="true">↓</span></a>
    </section>
    <section className="introduction section reveal" id="history"><p className="eyebrow">A place of wonder</p><div className="intro-grid"><h2>Angkor Wat is a masterpiece made for eternity.</h2><div><p>At the heart of Cambodia’s ancient capital lies its most celebrated temple. Its measured beauty, luminous carvings, and monumental scale have inspired generations of visitors and devotees.</p><a className="text-link" href="#explore">Read the story of Angkor <span aria-hidden="true">→</span></a></div></div></section>
    <section className="meaning section reveal"><div className="meaning-image"><img src={sunriseImage} alt="Sunlight on Angkor Wat" /></div><div><p className="eyebrow">Why Angkor matters</p><h2>Heritage that belongs to the world, and lives in Cambodia.</h2><p>Angkor is a living bridge between past and present. Its temples preserve remarkable Khmer knowledge, artistry, and spiritual traditions—while continuing to inspire the people who care for them today.</p></div></section>
    <section className="stories section" id="explore"><div className="section-heading reveal"><p className="eyebrow">Three perspectives</p><h2>Discover the soul of Angkor.</h2></div><div className="story-grid">{heritageStories.map((story) => <article className="story-card reveal" key={story.title}><span className="story-number">{story.number}</span><div className="stone-icon" aria-hidden="true">✦</div><h3>{story.title}</h3><p>{story.text}</p><a href="#visit" aria-label={`Learn about Angkor Wat ${story.title}`}>Discover <span aria-hidden="true">→</span></a></article>)}</div></section>
    <section className="gallery section" id="gallery"><div className="section-heading gallery-heading reveal"><div><p className="eyebrow">Fragments of Angkor</p><h2>Light, stone, and stillness.</h2></div><p>Select an image to pause, look closer, and discover a quiet fragment of Angkor.</p></div><div className="gallery-grid" aria-label="Angkor Wat visual gallery">{gallery.map((item) => <button className={`gallery-item ${item.className} reveal`} key={item.title} type="button" onClick={() => setSelectedImage(item)} aria-label={`View larger image: ${item.title}`}><img src={item.image} alt={item.title} /><span className="gallery-shade" /><span className="gallery-expand" aria-hidden="true">↗</span><span className="gallery-caption"><small>{item.detail}</small>{item.title}</span></button>)}</div></section>
    <section className="visit section reveal" id="visit"><div className="visit-copy"><p className="eyebrow">Plan your visit</p><h2>Arrive with wonder.<br />Leave with reverence.</h2><p>Experience Angkor Wat at its most peaceful in the early morning, and allow time to wander with care.</p><a className="button button-dark" href="mailto:hello@cangkorwat.com">Plan your journey <span aria-hidden="true">→</span></a></div><aside className="visit-details" aria-label="Visitor information"><div><span>Temple hours</span><strong>5:00 AM — 6:00 PM</strong></div><div><span>Best time</span><strong>Sunrise &amp; early morning</strong></div><div><span>Visit with care</span><strong>Dress respectfully and honour sacred spaces.</strong></div></aside></section>
    <section className="about section reveal" id="about"><p className="eyebrow">About C Angkorwat</p><div className="about-grid"><h2>A small tribute to Cambodia’s extraordinary heritage.</h2><p>C Angkorwat celebrates the beauty, history, and enduring cultural meaning of Angkor Wat. This journal invites visitors to look beyond the temple’s famous silhouette and appreciate the Khmer creativity, knowledge, and care that continue to keep its story alive.</p></div></section>
    <section className="contact section reveal" id="contact"><div><p className="eyebrow">Keep in touch</p><h2>Begin a conversation.</h2><p>This contact area is ready for your real details. Replace each highlighted placeholder before publishing.</p></div><address className="contact-details"><div><span>Your name</span><strong>Reagan Chhang</strong></div><div><span>Email address</span><a href="mailto:your-email@example.com">[YOUR EMAIL HERE]</a></div><div><span>Phone or WhatsApp</span><a href="tel:+0000000000">[YOUR PHONE NUMBER HERE]</a></div><div><span>Instagram or Facebook</span><a href="#contact">[YOUR SOCIAL LINK HERE]</a></div></address></section>
    <footer><a className="brand" href="#home"><TempleMark /><span>C Angkorwat</span></a><p>Celebrating the heritage of Cambodia.</p><p>© 2026 C Angkorwat</p></footer>
    {showBackToTop && <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ <span>Top</span></button>}
    {selectedImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={selectedImage.title} onClick={() => setSelectedImage(null)}><button className="lightbox-close" type="button" aria-label="Close image viewer" onClick={() => setSelectedImage(null)}>×</button><figure onClick={(event) => event.stopPropagation()}><img src={selectedImage.image} alt={selectedImage.title} /><figcaption><small>{selectedImage.detail}</small>{selectedImage.title}</figcaption></figure></div>}
  </main>
}

export default App
