import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ZodError } from 'zod'
import { defaultContent, type SiteContent } from '../content'
import { loadSiteContent, saveSiteContent, supabase, uploadMedia } from '../lib/supabase'
import './AdminDashboard.css'
import './AdminMedia.css'
import TranslationPanel from './TranslationPanel'
import TextToSpeechPanel from './TextToSpeechPanel'

type Panel = 'overview' | 'stories' | 'gallery' | 'models' | 'audio' | 'translations' | 'visit' | 'contact'

export default function AdminDashboard() {
  const [panel, setPanel] = useState<Panel>('overview')
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState('')

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

  const upload = async (file: File | undefined, kind: 'image' | 'audio' | 'model', key: string, onUploaded: (url: string) => void) => {
    if (!file) return
    setNotice('')
    setUploading(key)
    try {
      onUploaded(await uploadMedia(file, kind))
      setNotice(`${kind === 'image' ? 'Image' : kind === 'audio' ? 'Audio' : '3D model'} uploaded. Click Publish changes when you are ready.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setUploading('')
    }
  }

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link to="/" className="admin-brand">☼ C Angkorwat</Link><p>Content studio</p><nav>{(['overview','stories','gallery','models','audio','translations','visit','contact'] as Panel[]).map((item) => <button className={panel === item ? 'active' : ''} key={item} onClick={() => setPanel(item)}>{item === 'models' ? '3D & AR' : item}</button>)}</nav><Link className="view-site" to="/">← View public site</Link><button className="sign-out" onClick={() => supabase?.auth.signOut()}>Sign out</button></aside>
    <section className="admin-main"><header><div><p className="admin-kicker">C Angkorwat V2</p><h1>{panel === 'models' ? '3D & AR' : panel[0].toUpperCase() + panel.slice(1)}</h1></div><button className="publish" disabled={loading || publishing} onClick={publish}>{publishing ? 'Publishing…' : 'Publish changes'}</button></header>{notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading && <p role="status">Loading content…</p>}
      {!loading && panel === 'overview' && <div className="admin-cards"><article><span>Stories</span><strong>{content.stories.length}</strong><p>Heritage perspectives ready to publish.</p></article><article><span>Gallery</span><strong>{content.gallery.length}</strong><p>Curated visual fragments of Angkor.</p></article><article><span>Status</span><strong>Protected</strong><p>Authenticated administrator access is active.</p></article></div>}
      {panel === 'stories' && <div className="editor-list">{content.stories.map((story, index) => <article className="editor-card" key={story.number}><span>Story {story.number}</span><label>Title<input value={story.title} onChange={(e) => setContent({...content, stories: content.stories.map((s,i) => i === index ? {...s,title:e.target.value} : s)})} /></label><label>Description<textarea value={story.text} onChange={(e) => setContent({...content, stories: content.stories.map((s,i) => i === index ? {...s,text:e.target.value} : s)})} /></label></article>)}</div>}
      {panel === 'gallery' && <div className="editor-list">{content.gallery.map((item, index) => <article className="editor-card" key={item.className}><span>Image {index + 1}</span><label>Title<input value={item.title} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,title:e.target.value} : g)})} /></label><label>Caption<input value={item.detail} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,detail:e.target.value} : g)})} /></label><label className="upload-control">Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(uploading)} onChange={(e) => upload(e.target.files?.[0], 'image', `image-${index}`, (imageUrl) => setContent((current) => ({...current, gallery: current.gallery.map((g,i) => i === index ? {...g,imageUrl} : g)})))} /><small>JPG, PNG, WebP, or GIF · maximum 10 MB</small></label>{uploading === `image-${index}` && <p role="status">Uploading image…</p>}{item.imageUrl && <img className="media-preview" src={item.imageUrl} alt={`Preview of ${item.title}`} />}<label>Or public image URL<input type="url" placeholder="https://…" value={item.imageUrl} onChange={(e) => setContent({...content, gallery: content.gallery.map((g,i) => i === index ? {...g,imageUrl:e.target.value} : g)})} /></label></article>)}</div>}
      {panel === 'models' && <div><div className="panel-actions"><p>Upload a GLB for the website and Android AR. Add an optional USDZ for iPhone AR.</p><button type="button" onClick={() => setContent({...content,models:[...content.models,{title:'New 3D experience',description:'',modelUrl:'',iosUrl:'',posterUrl:''}]})}>Add 3D model</button></div><div className="editor-list">{content.models.map((item,index) => <article className="editor-card" key={index}><span>3D model {index + 1}</span><label>Title<input value={item.title} onChange={(e) => setContent({...content,models:content.models.map((model,i) => i === index ? {...model,title:e.target.value} : model)})} /></label><label>Description<textarea value={item.description} onChange={(e) => setContent({...content,models:content.models.map((model,i) => i === index ? {...model,description:e.target.value} : model)})} /></label><label className="upload-control">Upload GLB<input type="file" accept=".glb,model/gltf-binary" disabled={Boolean(uploading)} onChange={(e) => upload(e.target.files?.[0], 'model', `glb-${index}`, (modelUrl) => setContent((current) => ({...current,models:current.models.map((model,i) => i === index ? {...model,modelUrl} : model)})))} /><small>Required for web and Android · maximum 25 MB</small></label>{uploading === `glb-${index}` && <p role="status">Uploading GLB…</p>}<label className="upload-control">Upload USDZ<input type="file" accept=".usdz,model/vnd.usdz+zip" disabled={Boolean(uploading)} onChange={(e) => upload(e.target.files?.[0], 'model', `usdz-${index}`, (iosUrl) => setContent((current) => ({...current,models:current.models.map((model,i) => i === index ? {...model,iosUrl} : model)})))} /><small>Optional for iPhone AR · maximum 25 MB</small></label>{uploading === `usdz-${index}` && <p role="status">Uploading USDZ…</p>}<label>Optional poster image URL<input type="url" placeholder="https://…" value={item.posterUrl} onChange={(e) => setContent({...content,models:content.models.map((model,i) => i === index ? {...model,posterUrl:e.target.value} : model)})} /></label>{item.modelUrl && <p className="media-ready">✓ GLB ready</p>}{item.iosUrl && <p className="media-ready">✓ USDZ ready</p>}<button className="remove-media" type="button" onClick={() => setContent({...content,models:content.models.filter((_,i) => i !== index)})}>Remove 3D model</button></article>)}</div></div>}
      {panel === 'audio' && <div><TextToSpeechPanel onCreated={(audio) => setContent((current) => ({...current,audio:[...current.audio,audio]}))} /><div className="panel-actions"><p>Upload recordings, oral histories, music, or ambient sound.</p><button type="button" onClick={() => setContent({...content,audio:[...content.audio,{title:'New audio story',description:'',audioUrl:''}]})}>Add audio</button></div><div className="editor-list">{content.audio.map((item,index) => <article className="editor-card" key={index}><span>Audio {index + 1}</span><label>Title<input value={item.title} onChange={(e) => setContent({...content,audio:content.audio.map((a,i) => i === index ? {...a,title:e.target.value} : a)})} /></label><label>Description<textarea value={item.description} onChange={(e) => setContent({...content,audio:content.audio.map((a,i) => i === index ? {...a,description:e.target.value} : a)})} /></label><label className="upload-control">Upload audio<input type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm" disabled={Boolean(uploading)} onChange={(e) => upload(e.target.files?.[0], 'audio', `audio-${index}`, (audioUrl) => setContent((current) => ({...current,audio:current.audio.map((a,i) => i === index ? {...a,audioUrl} : a)})))} /><small>MP3, M4A, WAV, OGG, or WebM · maximum 25 MB</small></label>{uploading === `audio-${index}` && <p role="status">Uploading audio…</p>}{item.audioUrl && <audio className="media-audio-preview" controls preload="metadata" src={item.audioUrl} />}<button className="remove-media" type="button" onClick={() => setContent({...content,audio:content.audio.filter((_,i) => i !== index)})}>Remove audio</button></article>)}</div></div>}
      {panel === 'translations' && <TranslationPanel sourceContent={content} />}
      {panel === 'visit' && <div className="editor-card single"><label>Temple hours<input value={content.visit.hours} onChange={(e) => setContent({...content,visit:{...content.visit,hours:e.target.value}})} /></label><label>Best time<input value={content.visit.bestTime} onChange={(e) => setContent({...content,visit:{...content.visit,bestTime:e.target.value}})} /></label><label>Respectful visit guidance<textarea value={content.visit.guidance} onChange={(e) => setContent({...content,visit:{...content.visit,guidance:e.target.value}})} /></label></div>}
      {panel === 'contact' && <div className="editor-card single"><label>Email<input type="email" value={content.contact.email} onChange={(e) => setContent({...content,contact:{...content.contact,email:e.target.value}})} /></label><label>Phone or WhatsApp<input value={content.contact.phone} onChange={(e) => setContent({...content,contact:{...content.contact,phone:e.target.value}})} /></label><label>Social label<input value={content.contact.socialLabel} onChange={(e) => setContent({...content,contact:{...content.contact,socialLabel:e.target.value}})} /></label><label>Social URL<input value={content.contact.socialUrl} onChange={(e) => setContent({...content,contact:{...content.contact,socialUrl:e.target.value}})} /></label></div>}
    </section>
  </main>
}
