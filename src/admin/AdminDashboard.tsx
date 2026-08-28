import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ZodError } from 'zod'
import { defaultContent, type SiteContent } from '../content'
import { loadSiteContent, saveSiteContent, supabase } from '../lib/supabase'
import './AdminDashboard.css'

type Panel = 'overview' | 'stories' | 'gallery' | 'visit' | 'contact'

export default function AdminDashboard() {
  const [panel, setPanel] = useState<Panel>('overview')
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    loadSiteContent().then((saved) => saved && setContent(saved)).catch(() => setNotice('Could not load saved content.')).finally(() => setLoading(false))
  }, [])

  const publish = async () => {
    setPublishing(true)
    try {
      await saveSiteContent(content)
      setNotice('Changes published successfully.')
    } catch (error) {
      setNotice(error instanceof ZodError ? error.issues[0]?.message ?? 'Please correct the content fields.' : 'Publishing failed. Confirm your access and try again.')
    } finally {
      setPublishing(false)
    }
  }

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link to="/" className="admin-brand">☼ C Angkorwat</Link><p>Content studio</p><nav>{(['overview','stories','gallery','visit','contact'] as Panel[]).map((item) => <button className={panel === item ? 'active' : ''} key={item} onClick={() => setPanel(item)}>{item}</button>)}</nav><Link className="view-site" to="/">← View public site</Link><button className="sign-out" onClick={() => supabase?.auth.signOut()}>Sign out</button></aside>
    <section className="admin-main"><header><div><p className="admin-kicker">C Angkorwat V2</p><h1>{panel[0].toUpperCase() + panel.slice(1)}</h1></div><button className="publish" disabled={loading || publishing} onClick={publish}>{publishing ? 'Publishing…' : 'Publish changes'}</button></header>{notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading && <p role="status">Loading content…</p>}
      {!loading && panel === 'overview' && <div className="admin-cards"><article><span>Stories</span><strong>{content.stories.length}</strong><p>Heritage perspectives ready to publish.</p></article><article><span>Gallery</span><strong>{content.gallery.length}</strong><p>Curated visual fragments of Angkor.</p></article><article><span>Status</span><strong>Protected</strong><p>Authenticated administrator access is active.</p></article></div>}
      {panel === 'stories' && <div className="editor-list">{content.stories.map((story, index) => <article className="editor-card" key={story.number}><span>Story {story.number}</span><label>Title<input value={story.title} onChange={(e) => setContent({...content, stories: content.stories.map((s,i) => i === index ? {...s,title:e.target.value} : s)})} /></label><label>Description<textarea value={story.text} onChange={(e) => setContent({...content, stories: content.stories.map((s,i) => i === index ? {...s,text:e.target.value} : s)})} /></label></article>)}</div>}
      {panel === 'gallery' && <div className="editor-list">{content.gallery.map((item, index) => <article className="editor-card" key={item.className}><span>Image {index + 1}</span><label>Title<input value={item.title} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,title:e.target.value} : g)})} /></label><label>Caption<input value={item.detail} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,detail:e.target.value} : g)})} /></label><label>Public image URL<input placeholder="https://…" value={item.imageUrl} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,imageUrl:e.target.value} : g)})} /></label></article>)}</div>}
      {panel === 'visit' && <div className="editor-card single"><label>Temple hours<input value={content.visit.hours} onChange={(e) => setContent({...content,visit:{...content.visit,hours:e.target.value}})} /></label><label>Best time<input value={content.visit.bestTime} onChange={(e) => setContent({...content,visit:{...content.visit,bestTime:e.target.value}})} /></label><label>Respectful visit guidance<textarea value={content.visit.guidance} onChange={(e) => setContent({...content,visit:{...content.visit,guidance:e.target.value}})} /></label></div>}
      {panel === 'contact' && <div className="editor-card single"><label>Email<input type="email" value={content.contact.email} onChange={(e) => setContent({...content,contact:{...content.contact,email:e.target.value}})} /></label><label>Phone or WhatsApp<input value={content.contact.phone} onChange={(e) => setContent({...content,contact:{...content.contact,phone:e.target.value}})} /></label><label>Social label<input value={content.contact.socialLabel} onChange={(e) => setContent({...content,contact:{...content.contact,socialLabel:e.target.value}})} /></label><label>Social URL<input value={content.contact.socialUrl} onChange={(e) => setContent({...content,contact:{...content.contact,socialUrl:e.target.value}})} /></label></div>}
    </section>
  </main>
}
