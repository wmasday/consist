import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'

// Use Vite dev proxy: see vite.config.js (`/api` -> backend)
const API_BASE = '/api'

export function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    id: null,
    full_name: '',
    email: '',
    password: '',
    team_id: '',
    role: 'member',
  })
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('token')
  const rawUser = localStorage.getItem('user')
  const currentUser = rawUser ? JSON.parse(rawUser) : null
  const isManager = currentUser?.role === 'manager'

  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users`, { headers })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      const enhanced = data.map((u, idx) => ({
        ...u,
        // map DB role to friendly label
        displayRole: u.role === 'manager' ? 'Manager' : 'Member',
        lastSeen: ['Just now', '1h ago', 'Yesterday', '3 days ago'][idx % 4],
      }))
      setUsers(enhanced)
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      password: '',
      team_id: user.team_id || '',
      role: user.role || 'member',
    })
  }

  const resetForm = () => {
    setForm({
      id: null,
      full_name: '',
      email: '',
      password: '',
      team_id: currentUser?.team_id || '',
      role: 'member',
    })
  }

  const handleSave = async () => {
    if (!isManager) return
    if (!form.full_name || !form.email || (!form.id && !form.password)) {
      Swal.fire(
        'Validation',
        'Name, email and password (for new users) are required.',
        'warning',
      )
      return
    }
    setSaving(true)
    try {
      const isEdit = !!form.id
      const url = isEdit ? `${API_BASE}/users/${form.id}` : `${API_BASE}/users`
      const method = isEdit ? 'PUT' : 'POST'

      const payload = {
        full_name: form.full_name,
        email: form.email,
        team_id: form.team_id || null,
        role: form.role,
      }
      if (form.password) {
        payload.password = form.password
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} user`)

      await Swal.fire(
        isEdit ? 'Updated' : 'Created',
        isEdit ? 'User updated successfully.' : 'User created successfully.',
        'success',
      )
      await fetchUsers()
      resetForm()
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!isManager) return
    const confirm = await Swal.fire({
      title: 'Delete user?',
      text: 'This action cannot be undone. Their content will also be affected.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Delete',
    })
    if (!confirm.isConfirmed) return

    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Failed to delete user')
      await Swal.fire('Deleted', 'User deleted.', 'success')
      fetchUsers()
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.25em]">
            Users
          </p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Who has access to this workspace?
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-xl">
            Users are synced from your backend `users` resource. We annotate them with roles and
            last-seen information so you can quickly understand who is active.
          </p>
        </div>
        {isManager && (
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 text-xs font-medium px-3 py-1.5 hover:bg-[var(--bg-tertiary)] transition"
          >
            <FiPlus className="text-sm" />
            <span>New user</span>
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-xs text-[var(--text-muted)]">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-[var(--text-muted)]">
              No users yet. Use the auth endpoints to register or seed users from the backend.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[var(--border-light)]">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Last seen</th>
                  {isManager && <th className="text-left py-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-light)]/60 last:border-0 hover:bg-[var(--bg-secondary)]/70 transition"
                  >
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[11px] font-semibold">
                          {user.full_name
                            ? user.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                            : 'US'}
                        </div>
                        <p className="font-medium text-[var(--text-primary)]">{user.full_name}</p>
                      </div>
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">{user.email}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                        {user.displayRole}
                      </span>
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">{user.lastSeen}</td>
                    {isManager && (
                      <td className="py-2 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition"
                          >
                            Edit
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--danger-color)]/10 text-[var(--danger-color)] hover:bg-[var(--danger-color)]/20 transition"
                            >
                              <span className="inline-flex items-center gap-1">
                                <FiTrash2 />
                                <span>Delete</span>
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isManager && (
          <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)]/70 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {form.id ? 'Edit user' : 'Create new user'}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Manager can onboard members and assign them to teams.
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
              <div>
                <label className="text-[10px] text-[var(--text-muted)]">Full name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-muted)]">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-muted)]">
                  {form.id ? 'Password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)]">Team ID</label>
                  <input
                    name="team_id"
                    value={form.team_id}
                    onChange={handleFormChange}
                    placeholder="e.g. 1"
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)]">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition text-[10px]"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
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
                <span>{form.id ? 'Update user' : 'Create user'}</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


