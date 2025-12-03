import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi'

// Use Vite dev proxy: see vite.config.js (`/api` -> backend)
const API_BASE = '/api'

export function ContentPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [aiLogs, setAiLogs] = useState([])

  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }

  const fetchContents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/contents`, { headers })
      if (!res.ok) throw new Error('Failed to fetch contents')
      const data = await res.json()
      const enhanced = data.map((c, idx) => ({
        ...c,
        performance: ['Scaling', 'Experiment', 'Evergreen'][idx % 3],
        channel: ['Blog', 'Email', 'In-app', 'Docs'][idx % 4],
        ctr: (3.2 + idx * 0.4).toFixed(1) + '%',
      }))
      setItems(enhanced)
      if (enhanced.length && !selected) {
        handleSelect(enhanced[0])
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchContents()
    }
  }, [])

  const handleSelect = async (item) => {
    setSelected(item)
    setAiLogs([])
    try {
      const res = await fetch(`${API_BASE}/contents/${item.id}`, { headers })
      if (!res.ok) return
      const data = await res.json()
      const enhanced = {
        ...data,
        performance: item.performance,
        channel: item.channel,
        ctr: item.ctr,
      }
      setSelected(enhanced)
      setAiLogs(data.ai_logs || [])
      setForm({
        title: data.title || '',
        description: data.description || '',
        deadline: data.deadline || '',
        status: data.status || 'draft',
      })
    } catch {
      // ignore detail error for now
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      deadline: '',
      status: 'draft',
    })
    setSelected(null)
    setAiLogs([])
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateOrUpdate = async () => {
    if (!form.title || !form.description) {
      Swal.fire('Validation', 'Title and description are required.', 'warning')
      return
    }
    setSaving(true)
    try {
      const isEdit = !!selected
      const url = isEdit
        ? `${API_BASE}/contents/${selected.id}`
        : `${API_BASE}/contents`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} content`)
      const data = await res.json()

      Swal.fire(
        isEdit ? 'Updated' : 'Generated',
        isEdit
          ? 'Content updated and new AI summary generated.'
          : 'New AI content was added to your workspace.',
        'success',
      )

      await fetchContents()
      if (data.content) {
        handleSelect(data.content)
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setSaving(false)
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete content?',
      text: 'This will remove the content from your workspace history.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Delete',
    })
    if (!confirm.isConfirmed) return

    try {
      const res = await fetch(`${API_BASE}/contents/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Failed to delete content')
      Swal.fire('Deleted', 'Content removed.', 'success')
      setItems((prev) => prev.filter((i) => i.id !== id))
      if (selected?.id === id) {
        resetForm()
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.25em]">
            Content AI
          </p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Draft, experiment, and ship with AI
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-xl">
            Contents here are backed by your Express API. We enrich them with performance tags and
            channels so you can quickly scan what is live, in review, or experimental.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 text-xs font-medium px-3 py-2 hover:bg-[var(--bg-tertiary)] transition"
          >
            <FiPlus className="text-sm" />
            <span>New brief</span>
          </button>
          <button
            onClick={handleCreateOrUpdate}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gradient-primary)] text-dark text-xs font-medium px-4 py-2 shadow-md shadow-[var(--shadow-color)] hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition disabled:opacity-70"
          >
            {saving && (
              <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
            )}
            <span>{selected ? 'Update & re-run AI' : 'Create with AI'}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* List */}
        <div className="md:col-span-1 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-3 space-y-2 max-h-[420px] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-xs text-[var(--text-muted)]">
              Loading contents...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-xs text-[var(--text-muted)]">
              <p>No content yet.</p>
              <p className="text-[11px]">Use “Generate with AI” to create your first item.</p>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-left rounded-xl px-3 py-2 flex items-start gap-3 border ${
                  selected?.id === item.id
                    ? 'border-[var(--primary-color)] bg-[var(--bg-secondary)]'
                    : 'border-transparent hover:border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60'
                } transition`}
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--primary-color)]" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">
                    {item.body}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--info-color)]" />
                      {item.channel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-color)]" />
                      {item.performance}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail + editor + AI logs */}
        <div className="md:col-span-3 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-4 flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {selected ? 'Edit brief' : 'New brief'}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                    Define what you want AI to generate. We&apos;ll keep track of summaries in the
                    activity panel.
                  </p>
                </div>
                {selected && (
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--danger-color)]/10 text-[var(--danger-color)] text-xs hover:bg-[var(--danger-color)]/20 transition"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Write launch brief for new onboarding | Web & email"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2.5 text-xs md:text-sm outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={5}
                  placeholder="Describe the goal, audience, tone, and constraints for this content."
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2.5 text-xs md:text-sm outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="space-y-1">
                  <label className="text-[var(--text-muted)]">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-2 py-1.5 outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]/30 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[var(--text-muted)]">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-2 py-1.5 outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]/30 transition text-[10px]"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[var(--text-muted)]">Performance</label>
                  <p className="text-[var(--text-secondary)] mt-1">
                    {selected ? selected.performance : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* AI logs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    AI summaries for this brief
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Every time you update, we append a new `content_ai` entry linked by
                    `content_id`.
                  </p>
                </div>
                {selected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--info-color)]" />
                    {aiLogs.length} runs
                  </span>
                )}
              </div>
              <div className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/80 p-3 max-h-48 overflow-auto space-y-2 text-[11px]">
                {!selected ? (
                  <p className="text-[var(--text-muted)]">
                    Select or create a brief to see AI history.
                  </p>
                ) : aiLogs.length === 0 ? (
                  <p className="text-[var(--text-muted)]">
                    No AI summaries yet. Save this brief to generate the first summary.
                  </p>
                ) : (
                  aiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-2.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-[var(--text-primary)]">
                          {log.type}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        {log.ai_response}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


