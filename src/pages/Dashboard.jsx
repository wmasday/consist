import { useEffect, useState } from 'react'
import { FiZap } from 'react-icons/fi'

const API_BASE = '/api'

const toneClasses = {
  success: 'bg-[var(--success-color)]/15 text-[var(--success-color)]',
  info: 'bg-[var(--info-color)]/15 text-[var(--info-color)]',
  danger: 'bg-[var(--danger-color)]/15 text-[var(--danger-color)]',
}

export function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    inProgress: 0,
    done: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const fetchContentStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/contents`, { headers })
        if (!res.ok) throw new Error('Failed to load content stats')
        const data = await res.json()
        const total = data.length
        const drafts = data.filter((c) => c.status === 'draft').length
        const inProgress = data.filter((c) => c.status === 'in_progress').length
        const done = data.filter((c) => c.status === 'done').length
        setStats({ total, drafts, inProgress, done })
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }

    fetchContentStats()
  }, [])

  const cards = [
    {
      label: 'Content briefs in workspace',
      value: stats.total.toString().padStart(2, '0'),
      trend: stats.done ? `↑ ${stats.done} shipped` : '+0',
      tone: 'success',
      desc: 'Connected directly to your `contents` table in the database.',
    },
    {
      label: 'In-progress AI workflows',
      value: stats.inProgress.toString().padStart(2, '0'),
      trend: stats.drafts ? `${stats.drafts} drafts waiting` : 'No drafts',
      tone: 'info',
      desc: 'Content currently moving through your review pipeline.',
    },
    {
      label: 'Done & ready to ship',
      value: stats.done.toString().padStart(2, '0'),
      trend: stats.total ? `${Math.round((stats.done / (stats.total || 1)) * 100)}% of total` : '--',
      tone: 'success',
      desc: 'Briefs marked as `done` in this project&apos;s workflow.',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-[var(--text-muted)]">
            Overview
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Content health & AI performance
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-xl">
            Get a real-time snapshot of how AI-generated content is moving through your review
            pipeline, which channels are performing, and where teams are collaborating.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gradient-primary)] text-dark text-xs font-medium px-3 py-1.5 shadow-md shadow-[var(--shadow-color)] hover:shadow-lg hover:brightness-110 transition">
             <FiZap className="text-base" />
            <span>New AI campaign</span>
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 text-xs font-medium px-3 py-1.5 hover:bg-[var(--bg-tertiary)] transition">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--info-color)]" />
            <span>Live preview workspace</span>
          </button>
        </div>
      </div>

      {/* Stats (live from DB + dummy context) */}
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-4 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[var(--shadow-color)] transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${toneClasses[stat.tone]}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>{stat.trend}</span>
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              {loading ? '—' : stat.value}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Timeline & preview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Workflow activity</p>
            <span className="text-[10px] text-[var(--text-muted)]">Realtime feed</span>
          </div>
          <div className="space-y-3 text-[11px]">
            {[
              {
                label: 'Product Announcements',
                action: 'approved AI variant',
                by: 'Rizky (PM)',
                time: '2 min ago',
              },
              {
                label: 'Onboarding email series',
                action: 'requested tone adjustment',
                by: 'Sari (Marketing)',
                time: '18 min ago',
              },
              {
                label: 'Empty state UX copy',
                action: 'shipped to production',
                by: 'Andi (Design)',
                time: '36 min ago',
              },
            ].map((item) => (
              <div
                key={item.time}
                className="flex items-start gap-3 rounded-xl bg-[var(--bg-secondary)]/80 px-3 py-2 border border-transparent hover:border-[var(--border-color)] transition"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--primary-color)]" />
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-[var(--text-secondary)]">
                    {item.by} <span className="text-[var(--info-color)]">{item.action}</span>
                  </p>
                </div>
                <span className="text-[var(--text-muted)]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/60 p-4 space-y-3">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Channel mix</p>
          <div className="relative h-32 overflow-hidden rounded-xl bg-[var(--bg-secondary)]/80 flex items-end gap-1.5 p-2">
            {[
              { label: 'Blog', value: 80, color: 'var(--primary-color)' },
              { label: 'Email', value: 58, color: 'var(--secondary-color)' },
              { label: 'In-app', value: 42, color: 'var(--accent-color)' },
              { label: 'Paid', value: 36, color: 'var(--info-color)' },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-full bg-[var(--bg-tertiary)]/80 overflow-hidden"
                  style={{ height: `${bar.value + 20}px` }}
                >
                  <div
                    className="w-full h-full rounded-full transition-all duration-700 ease-out origin-bottom"
                    style={{
                      background: `linear-gradient(to top, ${bar.color}, transparent)`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{bar.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Based on AI-generated assets shipped to production over the last 7 days.
          </p>
        </div>
      </div>
    </div>
  )
}


