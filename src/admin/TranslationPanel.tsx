import { useEffect, useState } from 'react'
import { siteContentSchema, type SiteContent } from '../content'
import { localeNames, targetLocales, type Locale, type TranslationStatus } from '../i18n'
import { loadTranslation, requestAiTranslation, saveTranslation } from '../lib/supabase'

type TargetLocale = Exclude<Locale, 'en'>
type PathPart = string | number
type ReviewField = { section: string; label: string; path: PathPart[]; source: string }

function reviewFields(content: SiteContent): ReviewField[] {
  return [
    ...content.stories.flatMap((item, index) => [
      { section: `Story ${item.number}`, label: 'Title', path: ['stories', index, 'title'], source: item.title },
      { section: `Story ${item.number}`, label: 'Description', path: ['stories', index, 'text'], source: item.text },
    ]),
    ...content.gallery.flatMap((item, index) => [
      { section: `Gallery image ${index + 1}`, label: 'Title', path: ['gallery', index, 'title'], source: item.title },
      { section: `Gallery image ${index + 1}`, label: 'Caption', path: ['gallery', index, 'detail'], source: item.detail },
    ]),
    ...content.audio.flatMap((item, index) => [
      { section: `Audio ${index + 1}`, label: 'Title', path: ['audio', index, 'title'], source: item.title },
      { section: `Audio ${index + 1}`, label: 'Description', path: ['audio', index, 'description'], source: item.description },
    ]),
    ...content.models.flatMap((item, index) => [
      { section: `3D model ${index + 1}`, label: 'Title', path: ['models', index, 'title'], source: item.title },
      { section: `3D model ${index + 1}`, label: 'Description', path: ['models', index, 'description'], source: item.description },
    ]),
    { section: 'Visit', label: 'Temple hours', path: ['visit', 'hours'], source: content.visit.hours },
    { section: 'Visit', label: 'Best time', path: ['visit', 'bestTime'], source: content.visit.bestTime },
    { section: 'Visit', label: 'Guidance', path: ['visit', 'guidance'], source: content.visit.guidance },
    { section: 'Contact', label: 'Social label', path: ['contact', 'socialLabel'], source: content.contact.socialLabel },
  ]
}

function valueAtPath(content: SiteContent, path: PathPart[]) {
  let value: unknown = content
  for (const part of path) value = (value as Record<string | number, unknown>)[part]
  return typeof value === 'string' ? value : ''
}

export default function TranslationPanel({ sourceContent }: { sourceContent: SiteContent }) {
  const [locale, setLocale] = useState<TargetLocale>('km')
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<TranslationStatus | 'missing'>('missing')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadTranslation(locale).then((record) => {
      setDraft(record ? JSON.stringify(record.content, null, 2) : '')
      setStatus(record?.status ?? 'missing')
    }).catch((error) => setNotice(error instanceof Error ? error.message : 'Could not load translation.')).finally(() => setBusy(false))
  }, [locale])

  const parsedDraft = () => siteContentSchema.parse(JSON.parse(draft))
  let draftContent: SiteContent | null = null
  if (draft) {
    try {
      const result = siteContentSchema.safeParse(JSON.parse(draft))
      if (result.success) draftContent = result.data
    } catch {
      // Keep the advanced editor usable while its JSON is temporarily incomplete.
    }
  }
  const fields = reviewFields(sourceContent)

  const updateField = (path: PathPart[], value: string) => {
    if (!draftContent) return
    const updated = structuredClone(draftContent) as unknown as Record<string | number, unknown>
    let cursor = updated
    path.slice(0, -1).forEach((part) => { cursor = cursor[part] as Record<string | number, unknown> })
    cursor[path[path.length - 1]] = value
    setDraft(JSON.stringify(updated, null, 2))
    setStatus('draft')
  }

  const translate = async () => {
    setBusy(true)
    setNotice('')
    try {
      const content = await requestAiTranslation(locale, sourceContent)
      setDraft(JSON.stringify(content, null, 2))
      setStatus('draft')
      setNotice('AI draft created. Review every field before publishing.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'AI translation failed.')
    } finally {
      setBusy(false)
    }
  }

  const save = async (nextStatus: TranslationStatus) => {
    setBusy(true)
    setNotice('')
    try {
      await saveTranslation(locale, parsedDraft(), nextStatus)
      setStatus(nextStatus)
      setNotice(nextStatus === 'published' ? `${localeNames[locale]} translation published.` : `Translation saved as ${nextStatus}.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save translation.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="translation-studio">
    <div className="translation-toolbar">
      <label>Target language<select value={locale} onChange={(event) => { setBusy(true); setNotice(''); setLocale(event.target.value as TargetLocale) }}>{targetLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label>
      <span className={`translation-status status-${status}`}>{status === 'missing' ? 'Missing' : status === 'draft' ? 'AI draft' : status}</span>
      <button type="button" disabled={busy} onClick={translate}>{busy ? 'Working…' : 'Translate with AI'}</button>
    </div>
    <p className="translation-help">AI translations are drafts. Review names, heritage terminology, URLs, and cultural meaning before publishing.</p>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {!draftContent && <div className="translation-empty"><strong>No translation draft yet.</strong><p>Click Translate with AI to create an editable {localeNames[locale]} draft.</p></div>}
    {draftContent && <div className="translation-review"><div className="translation-review-head"><strong>English source</strong><strong>{localeNames[locale]} translation</strong></div>{fields.map((field) => <article className="translation-row" key={field.path.join('.')}><div><span>{field.section} · {field.label}</span><p>{field.source || '—'}</p></div><label><span>{localeNames[locale]}</span><textarea lang={locale} value={valueAtPath(draftContent, field.path)} onChange={(event) => updateField(field.path, event.target.value)} /></label></article>)}</div>}
    <details className="translation-advanced"><summary>Advanced: edit translation JSON</summary><label className="translation-json">Translation content<textarea spellCheck="false" value={draft} placeholder="Create an AI draft first." onChange={(event) => { setDraft(event.target.value); setStatus('draft') }} /></label></details>
    <div className="translation-actions">
      <button type="button" disabled={busy || !draft} onClick={() => save('draft')}>Save draft</button>
      <button type="button" disabled={busy || !draft} onClick={() => save('reviewed')}>Mark reviewed</button>
      <button className="publish-translation" type="button" disabled={busy || !draft || status !== 'reviewed'} onClick={() => save('published')}>Publish translation</button>
    </div>
  </section>
}
