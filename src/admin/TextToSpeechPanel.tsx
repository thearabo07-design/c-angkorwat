import { useState } from 'react'
import { localeNames } from '../i18n'
import { requestTextToSpeech, uploadMedia, type SpeechLanguage, type SpeechVoice } from '../lib/supabase'

const speechLanguages: SpeechLanguage[] = ['en', 'km', 'fr', 'zh-CN']
const voices: Array<{ value: SpeechVoice; label: string }> = [
  { value: 'coral', label: 'Coral — warm' },
  { value: 'nova', label: 'Nova — clear' },
  { value: 'onyx', label: 'Onyx — deep' },
]

export default function TextToSpeechPanel({ onCreated }: { onCreated: (audio: { title: string; description: string; audioUrl: string }) => void }) {
  const [title, setTitle] = useState('AI narrated story')
  const [script, setScript] = useState('')
  const [language, setLanguage] = useState<SpeechLanguage>('km')
  const [voice, setVoice] = useState<SpeechVoice>('coral')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const generate = async () => {
    if (!script.trim()) return setNotice('Enter the words you want the voice to speak.')
    setBusy(true)
    setNotice('Generating speech…')
    try {
      const file = await requestTextToSpeech(script.trim(), language, voice)
      setNotice('Uploading generated audio…')
      const audioUrl = await uploadMedia(file, 'audio')
      onCreated({ title: title.trim() || 'AI narrated story', description: script.trim(), audioUrl })
      setNotice('Speech generated and added below. Preview it, then click Publish changes.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not generate speech.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="tts-panel">
    <div className="tts-heading"><div><span>AI voice studio</span><h2>Text to Speech</h2></div><p>Generated audio uses OpenAI API credit.</p></div>
    <div className="tts-options">
      <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value as SpeechLanguage)}>{speechLanguages.map((item) => <option value={item} key={item}>{localeNames[item]}</option>)}</select></label>
      <label>Voice<select value={voice} onChange={(event) => setVoice(event.target.value as SpeechVoice)}>{voices.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
    </div>
    <label>Audio title<input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label>
    <label>Words to speak<textarea lang={language} maxLength={4000} value={script} placeholder="Type or paste the narration here…" onChange={(event) => setScript(event.target.value)} /><small>{script.length} / 4,000 characters</small></label>
    <div className="tts-footer"><p>This voice is AI-generated. Review pronunciation before publishing.</p><button type="button" disabled={busy || !script.trim()} onClick={generate}>{busy ? 'Generating…' : 'Generate speech'}</button></div>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
  </section>
}
