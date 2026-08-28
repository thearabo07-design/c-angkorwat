import { useEffect, useState } from 'react'
import { defaultContent, type SiteContent } from '../content'
import { isSupabaseConfigured, loadSiteContent, saveSiteContent, supabase } from '../lib/supabase'
import './AdminDashboard.css'

type Panel = 'overview' | 'stories' | 'gallery' | 'visit' | 'contact'

export default function AdminDashboard() {
  const [panel, setPanel] = useState<Panel>('overview')
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(!isSupabaseConfigured)
  const [notice, setNotice] = useState(isSupabaseConfigured ? '' : 'Preview mode — connect Supabase to enable secure login and publishing.')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authenticated) return
    loadSiteContent().then((saved) => saved && setContent(saved)).catch(() => setNotice('Could not load saved content. Check the Supabase setup.'))
  }, [authenticated])

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase) return setAuthenticated(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setNotice(error.message)
  }

  const publish = async () => {
    try {
      await saveSiteContent(content)
      setNotice(isSupabaseConfigured ? 'Changes published successfully.' : 'Preview saved for this session. Connect Supabase to publish.')
    } catch {
      setNotice('Publishing failed. Confirm the database policy and try again.')
    }
  }

  if (!authenticated) return <main className="admin-login"><form onSubmit={signIn}><a href="#home" className="admin-brand">☼ C Angkorwat</a><p className="admin-kicker">Administration</p><h1>Welcome back.</h1><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>{notice && <p className="admin-notice">{notice}</p>}<button type="submit">Sign in</button></form></main>

  return <main className="admin-shell">
    <aside className="admin-sidebar"><a href="#home" className="admin-brand">☼ C Angkorwat</a><p>Content studio</p><nav>{(['overview','stories','gallery','visit','contact'] as Panel[]).map((item) => <button className={panel === item ? 'active' : ''} key={item} onClick={() => setPanel(item)}>{item}</button>)}</nav><a className="view-site" href="#home">← View public site</a>{supabase && <button className="sign-out" onClick={() => supabase?.auth.signOut()}>Sign out</button>}</aside>
    <section className="admin-main"><header><div><p className="admin-kicker">C Angkorwat V2</p><h1>{panel[0].toUpperCase() + panel.slice(1)}</h1></div><button className="publish" onClick={publish}>Publish changes</button></header>{notice && <p className="admin-notice">{notice}</p>}
      {panel === 'overview' && <div className="admin-cards"><article><span>Stories</span><strong>{content.stories.length}</strong><p>Heritage perspectives ready to publish.</p></article><article><span>Gallery</span><strong>{content.gallery.length}</strong><p>Curated visual fragments of Angkor.</p></article><article><span>Status</span><strong>{isSupabaseConfigured ? 'Live' : 'Preview'}</strong><p>{isSupabaseConfigured ? 'Connected to Supabase.' : 'Waiting for Supabase credentials.'}</p></article></div>}
      {panel === 'stories' && <div className="editor-list">{content.stories.map((story, index) => <article className="editor-card" key={story.number}><span>Story {story.number}</span><label>Title<input value={story.title} onChange={(e) => setContent({...content, stories: content.stories.map((s,i) => i === index ? {...s,title:e.target.value} : s)})} /></label><label>Description<textarea value={story.text} onChange={(e) => setContent({...content, stories: content.stories.map((s,i) => i === index ? {...s,text:e.target.value} : s)})} /></label></article>)}</div>}
      {panel === 'gallery' && <div className="editor-list">{content.gallery.map((item, index) => <article className="editor-card" key={item.className}><span>Image {index + 1}</span><label>Title<input value={item.title} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,title:e.target.value} : g)})} /></label><label>Caption<input value={item.detail} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,detail:e.target.value} : g)})} /></label><label>Public image URL<input placeholder="https://…" value={item.imageUrl} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,imageUrl:e.target.value} : g)})} /></label></article>)}</div>}
      {panel === 'visit' && <div className="editor-card single"><label>Temple hours<input value={content.visit.hours} onChange={(e) => setContent({...content,visit:{...content.visit,hours:e.target.value}})} /></label><label>Best time<input value={content.visit.bestTime} onChange={(e) => setContent({...content,visit:{...content.visit,bestTime:e.target.value}})} /></label><label>Respectful visit guidance<textarea value={content.visit.guidance} onChange={(e) => setContent({...content,visit:{...content.visit,guidance:e.target.value}})} /></label></div>}
      {panel === 'contact' && <div className="editor-card single"><label>Email<input type="email" value={content.contact.email} onChange={(e) => setContent({...content,contact:{...content.contact,email:e.target.value}})} /></label><label>Phone or WhatsApp<input value={content.contact.phone} onChange={(e) => setContent({...content,contact:{...content.contact,phone:e.target.value}})} /></label><label>Social label<input value={content.contact.socialLabel} onChange={(e) => setContent({...content,contact:{...content.contact,socialLabel:e.target.value}})} /></label><label>Social URL<input value={content.contact.socialUrl} onChange={(e) => setContent({...content,contact:{...content.contact,socialUrl:e.target.value}})} /></label></div>}
    </section>
  </main>
}
