import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'

// Use Vite dev proxy: see vite.config.js (`/api` -> backend)
const API_BASE = '/api'

export function TeamPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ id: null, name: '' })
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/teams`, { headers })
      if (!res.ok) throw new Error('Failed to fetch teams')
      const data = await res.json()
      const enhanced = data.map((t, idx) => ({
        ...t,
        membersCount: 3 + idx * 2,
        activeCampaigns: 1 + (idx % 4),
      }))
      setTeams(enhanced)
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchTeams()
  }, [])

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleEdit = (team) => {
    setForm({ id: team.id, name: team.name })
  }

  const resetForm = () => {
    setForm({ id: null, name: '' })
  }

  const handleSave = async () => {
    if (!form.name) {
      Swal.fire('Validation', 'Team name is required.', 'warning')
      return
    }
    setSaving(true)
    try {
      const isEdit = !!form.id
      const url = isEdit ? `${API_BASE}/teams/${form.id}` : `${API_BASE}/teams`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ name: form.name }),
      })
      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} team`)

      await Swal.fire(
        isEdit ? 'Updated' : 'Created',
        isEdit ? 'Team updated successfully.' : 'Team created successfully.',
        'success',
      )
      await fetchTeams()
      resetForm()
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete team?',
      text: 'This will also affect members attached to this team.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Delete',
    })
    if (!confirm.isConfirmed) return

    try {
      const res = await fetch(`${API_BASE}/teams/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Failed to delete team')
      await Swal.fire('Deleted', 'Team deleted.', 'success')
      fetchTeams()
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.25em]">
            Teams
          </p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Who is collaborating on AI content?
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-xl">
            Teams are managed from your backend. Here we surface a lightweight cockpit view with
            members, campaigns, and focus areas enriched with dummy analytics.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-xs text-[var(--text-muted)]">
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-[var(--text-muted)]">
              No teams yet. Seed some data from the backend or create a new one.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[var(--border-light)]">
                  <th className="text-left py-2 font-medium">Team</th>
                  <th className="text-left py-2 font-medium">Members</th>
                  <th className="text-left py-2 font-medium">Active campaigns</th>
                  <th className="text-left py-2 font-medium">Focus</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => (
                  <tr
                    key={team.id}
                    className="border-b border-[var(--border-light)]/60 last:border-0 hover:bg-[var(--bg-secondary)]/70 transition"
                  >
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[11px] font-semibold">
                          {team.name?.slice(0, 2).toUpperCase() || 'TM'}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{team.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            Workspace #{idx + 1}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">{team.membersCount}</td>
                    <td className="py-2 text-[var(--text-secondary)]">{team.activeCampaigns}</td>
                    <td className="py-2 text-[var(--text-secondary)]">
                      {['Lifecycle', 'Acquisition', 'Product', 'Brand'][idx % 4]}
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(team.id)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--danger-color)]/10 text-[var(--danger-color)] hover:bg-[var(--danger-color)]/20 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {form.id ? 'Edit team' : 'Create new team'}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Group members by growth, product, lifecycle, and more.
              </p>
            </div>
            {form.id && (
              <button
                onClick={resetForm}
                className="text-[10px] text-[var(--primary-color)] hover:text-[var(--primary-dark)]"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-[var(--text-muted)]">Team name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="e.g. Lifecycle, Product Growth"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gradient-primary)] text-dark text-xs font-medium py-2.5 shadow-md shadow-[var(--shadow-color)] hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition disabled:opacity-70"
          >
            {saving && (
              <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
            )}
            <span className="inline-flex items-center gap-1">
              {!form.id && <FiPlus />}
              <span>{form.id ? 'Update team' : 'Create team'}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}


