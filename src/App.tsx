import { useEffect, useState } from 'react'
import heroImage from './assets/hero.png'
import sunriseImage from './assets/angkor-sunrise-optimized.jpg'
import { defaultContent, type GalleryItem } from './content'
import { loadSiteContent } from './lib/supabase'
import './App.css'
import './Audio.css'

function TempleMark() { return <span className="temple-mark" aria-hidden="true">☼</span> }

function App() {
  const [content, setContent] = useState(defaultContent)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<(GalleryItem & { image: string }) | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    loadSiteContent().then((saved) => saved && setContent(saved)).catch(() => undefined)
  }, [])

  useEffect(() => {
    const showButton = () => setShowBackToTop(window.scrollY > 550)
    window.addEventListener('scroll', showButton, { passive: true })
    return () => window.removeEventListener('scroll', showButton)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const gallery = content.gallery.map((item, index) => ({
    ...item,
    image: item.imageUrl || (index === 1 ? heroImage : sunriseImage),
  }))
  const publishedAudio = content.audio.filter((item) => item.audioUrl)

  return <main>
    <section className="hero" id="home">
      <img className="hero-image" src={sunriseImage} alt="Angkor Wat at sunrise" />
      <div className="hero-overlay" />
      <header className="site-header">
        <a className="brand" href="#home" aria-label="C Angkorwat home"><TempleMark /><span>C Angkorwat</span></a>
        <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation"><span /><span /><span /><span className="sr-only">Open menu</span></button>
        <nav id="main-navigation" className={menuOpen ? 'open' : ''} aria-label="Main navigation"><a onClick={closeMenu} href="#home">Home</a><a onClick={closeMenu} href="#history">History</a><a onClick={closeMenu} href="#explore">Explore</a><a onClick={closeMenu} href="#gallery">Gallery</a>{publishedAudio.length > 0 && <a onClick={closeMenu} href="#audio">Listen</a>}<a onClick={closeMenu} href="#visit">Visit</a><a onClick={closeMenu} href="#guide">Guide</a><a onClick={closeMenu} href="#contact">Contact</a></nav>
      </header>
      <div className="hero-content reveal"><p className="eyebrow">A Khmer heritage journal</p><h1>Where stone<br />holds memory.</h1><p className="hero-copy">Enter the world of Angkor Wat—an enduring wonder shaped by faith, artistry, and the spirit of Cambodia.</p><a className="button button-gold" href="#explore">Explore the heritage <span aria-hidden="true">↘</span></a></div>
      <a className="scroll-cue" href="#history">Scroll to discover <span aria-hidden="true">↓</span></a>
    </section>
    <section className="introduction section reveal" id="history"><p className="eyebrow">A place of wonder</p><div className="intro-grid"><h2>Angkor Wat is a masterpiece made for eternity.</h2><div><p>At the heart of Cambodia’s ancient capital lies its most celebrated temple. Its measured beauty, luminous carvings, and monumental scale have inspired generations of visitors and devotees.</p><a className="text-link" href="#explore">Read the story of Angkor <span aria-hidden="true">→</span></a></div></div></section>
    <section className="meaning section reveal"><div className="meaning-image"><img src={sunriseImage} alt="Sunlight on Angkor Wat" /></div><div><p className="eyebrow">Why Angkor matters</p><h2>Heritage that belongs to the world, and lives in Cambodia.</h2><p>Angkor is a living bridge between past and present. Its temples preserve remarkable Khmer knowledge, artistry, and spiritual traditions—while continuing to inspire the people who care for them today.</p></div></section>
    <section className="stories section" id="explore"><div className="section-heading reveal"><p className="eyebrow">Three perspectives</p><h2>Discover the soul of Angkor.</h2></div><div className="story-grid">{content.stories.map((story) => <article className="story-card reveal" key={story.title}><span className="story-number">{story.number}</span><div className="stone-icon" aria-hidden="true">✦</div><h3>{story.title}</h3><p>{story.text}</p><a href="#visit" aria-label={`Learn about Angkor Wat ${story.title}`}>Discover <span aria-hidden="true">→</span></a></article>)}</div></section>
    <section className="gallery section" id="gallery"><div className="section-heading gallery-heading reveal"><div><p className="eyebrow">Fragments of Angkor</p><h2>Light, stone, and stillness.</h2></div><p>Select an image to pause, look closer, and discover a quiet fragment of Angkor.</p></div><div className="gallery-grid" aria-label="Angkor Wat visual gallery">{gallery.map((item) => <button className={`gallery-item ${item.className} reveal`} key={item.title} type="button" onClick={() => setSelectedImage(item)} aria-label={`View larger image: ${item.title}`}><img src={item.image} alt={item.title} /><span className="gallery-shade" /><span className="gallery-expand" aria-hidden="true">↗</span><span className="gallery-caption"><small>{item.detail}</small>{item.title}</span></button>)}</div></section>
    {publishedAudio.length > 0 && <section className="audio-stories section" id="audio"><div className="section-heading reveal"><p className="eyebrow">Voices of Angkor</p><h2>Listen to the heritage.</h2></div><div className="audio-grid">{publishedAudio.map((item, index) => <article className="audio-card reveal" key={`${item.audioUrl}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<audio controls preload="metadata" src={item.audioUrl}>Your browser does not support audio playback.</audio></article>)}</div></section>}
    <section className="visit section reveal" id="visit"><div className="visit-copy"><p className="eyebrow">Plan your visit</p><h2>Arrive with wonder.<br />Leave with reverence.</h2><p>Experience Angkor Wat at its most peaceful in the early morning, and allow time to wander with care.</p><a className="button button-dark" href={content.contact.email ? `mailto:${content.contact.email}` : '#contact'}>Plan your journey <span aria-hidden="true">→</span></a></div><aside className="visit-details" aria-label="Visitor information"><div><span>Temple hours</span><strong>{content.visit.hours}</strong></div><div><span>Best time</span><strong>{content.visit.bestTime}</strong></div><div><span>Visit with care</span><strong>{content.visit.guidance}</strong></div></aside></section>
    <section className="guide section reveal" id="guide"><div className="guide-heading"><p className="eyebrow">A gentle one-day guide</p><h2>Let the day unfold slowly.</h2><p>Allow room for rest, reflection, and the small details that make Angkor memorable.</p></div><div className="itinerary"><article><span>Early morning</span><h3>Welcome the dawn</h3><p>Begin quietly and take time to watch the temple emerge with the light.</p></article><article><span>Late morning</span><h3>Walk the galleries</h3><p>Explore at an unhurried pace. Pause to notice the carved stories along the walls.</p></article><article><span>Midday</span><h3>Rest and reset</h3><p>Find shade, drink water, and take a break before returning to the site.</p></article><article><span>Afternoon</span><h3>Follow your curiosity</h3><p>Choose one area to revisit slowly and leave space for a final, quiet view.</p></article></div><div className="guide-bottom"><div><p className="eyebrow">Visit with respect</p><p>Wear clothing that covers shoulders and knees in sacred areas. Speak softly, follow site signs, and never climb or touch fragile carvings.</p></div><div><p className="eyebrow">Bring along</p><ul><li>Water bottle</li><li>Sun protection</li><li>Comfortable walking shoes</li><li>A light cover for sacred spaces</li></ul></div></div></section>
    <section className="about section reveal" id="about"><p className="eyebrow">About C Angkorwat</p><div className="about-grid"><h2>A small tribute to Cambodia’s extraordinary heritage.</h2><p>C Angkorwat celebrates the beauty, history, and enduring cultural meaning of Angkor Wat. This journal invites visitors to look beyond the temple’s famous silhouette and appreciate the Khmer creativity, knowledge, and care that continue to keep its story alive.</p></div></section>
    <section className="contact section reveal" id="contact"><div><p className="eyebrow">Keep in touch</p><h2>Begin a conversation.</h2><p>{content.contact.email || content.contact.phone || content.contact.socialUrl ? 'Connect with C Angkorwat using the details below.' : 'Contact details will be available here soon.'}</p></div>{(content.contact.email || content.contact.phone || content.contact.socialUrl) && <address className="contact-details">{content.contact.email && <div><span>Email</span><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a></div>}{content.contact.phone && <div><span>Phone or WhatsApp</span><a href={`tel:${content.contact.phone}`}>{content.contact.phone}</a></div>}{content.contact.socialUrl && <div><span>Social</span><a href={content.contact.socialUrl}>{content.contact.socialLabel || 'Follow C Angkorwat'}</a></div>}</address>}</section>
    <footer><a className="brand" href="#home"><TempleMark /><span>C Angkorwat</span></a><p>Celebrating the heritage of Cambodia.</p><p>© 2026 C Angkorwat</p></footer>
    {showBackToTop && <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ <span>Top</span></button>}
    {selectedImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={selectedImage.title} onClick={() => setSelectedImage(null)}><button className="lightbox-close" type="button" aria-label="Close image viewer" onClick={() => setSelectedImage(null)}>×</button><figure onClick={(event) => event.stopPropagation()}><img src={selectedImage.image} alt={selectedImage.title} /><figcaption><small>{selectedImage.detail}</small>{selectedImage.title}</figcaption></figure></div>}
  </main>
}

export default App
