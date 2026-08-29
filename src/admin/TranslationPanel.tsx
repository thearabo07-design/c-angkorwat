import { useEffect, useState } from 'react'
import { siteContentSchema, type SiteContent } from '../content'
import { localeNames, targetLocales, type Locale, type TranslationStatus } from '../i18n'
import { loadTranslation, requestAiTranslation, saveTranslation } from '../lib/supabase'

type TargetLocale = Exclude<Locale, 'en'>

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
    <label className="translation-json">Translation content<textarea spellCheck="false" value={draft} placeholder="Create an AI draft or paste reviewed translation JSON here." onChange={(event) => { setDraft(event.target.value); setStatus('draft') }} /></label>
    <div className="translation-actions">
      <button type="button" disabled={busy || !draft} onClick={() => save('draft')}>Save draft</button>
      <button type="button" disabled={busy || !draft} onClick={() => save('reviewed')}>Mark reviewed</button>
      <button className="publish-translation" type="button" disabled={busy || !draft || status !== 'reviewed'} onClick={() => save('published')}>Publish translation</button>
    </div>
  </section>
}
