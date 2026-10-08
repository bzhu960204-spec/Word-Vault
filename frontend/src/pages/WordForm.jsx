import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createWord, getWord, updateWord } from '../api/words.js'
import TagInput from '../components/TagInput.jsx'
import styles from './WordForm.module.css'

const empty = {
  text: '',
  translation: '',
  partOfSpeech: '',
  exampleEn: '',
  exampleCn: '',
  usageNote: '',
  tags: '',
  source: '',
  familiarity: 0,
}

export default function WordForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [data, setData] = useState(empty)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getWord(id)
      .then((w) =>
        setData({
          text: w.text || '',
          translation: w.translation || '',
          partOfSpeech: w.partOfSpeech || '',
          exampleEn: w.exampleEn || '',
          exampleCn: w.exampleCn || '',
          usageNote: w.usageNote || '',
          tags: w.tags || '',
          source: w.source || '',
          familiarity: w.familiarity ?? 0,
        })
      )
      .catch((e) => setError(e.message))
  }, [id, isEdit])

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = { ...data, familiarity: Number(data.familiarity) }
      const w = isEdit ? await updateWord(id, payload) : await createWord(payload)
      navigate(`/words/${w.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1>{isEdit ? '编辑单词' : '新增单词'}</h1>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>英文单词 *</label>
            <input
              value={data.text}
              onChange={(e) => update('text', e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>词性</label>
            <input
              value={data.partOfSpeech}
              onChange={(e) => update('partOfSpeech', e.target.value)}
              placeholder="n. / v. / adj."
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>中文含义</label>
          <input
            value={data.translation}
            onChange={(e) => update('translation', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>英文例句</label>
          <textarea
            value={data.exampleEn}
            onChange={(e) => update('exampleEn', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>例句中文翻译</label>
          <textarea
            value={data.exampleCn}
            onChange={(e) => update('exampleCn', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>用法说明</label>
          <textarea
            value={data.usageNote}
            onChange={(e) => update('usageNote', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>来源</label>
          <input
            value={data.source}
            onChange={(e) => update('source', e.target.value)}
            placeholder="如：GRE词汇书、经济学人2024-01"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>标签</label>
            <TagInput value={data.tags} onChange={(v) => update('tags', v)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>熟悉度 (0-5)</label>
            <select
              value={data.familiarity}
              onChange={(e) => update('familiarity', e.target.value)}
            >
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={() => navigate(-1)} disabled={saving}>
            取消
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
