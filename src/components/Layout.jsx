import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  FiLayout,
  FiZap,
  FiUsers,
  FiUserCheck,
  FiSun,
  FiMoon,
} from 'react-icons/fi'

export function Layout({ children }) {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)

    const rawUser = localStorage.getItem('user')
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser))
      } catch {
        setUser(null)
      }
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FiLayout },
    { to: '/content', label: 'Content AI', icon: FiZap },
    ...(user?.role === 'manager'
      ? [
          { to: '/teams', label: 'Teams', icon: FiUsers },
          { to: '/users', label: 'Users', icon: FiUserCheck },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/70 backdrop-blur-xl shadow-lg">
          <div className="px-6 py-5 border-b border-[var(--border-light)] flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center shadow-md shadow-[var(--shadow-color)]">
              <span className="text-xl font-semibold text-white">C</span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Consist Studio</p>
              <p className="font-semibold text-[var(--text-primary)] tracking-tight">
                AI Content Panel
              </p>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--primary-color)] text-[var(--text-light)] shadow-md shadow-[var(--shadow-color-dark)] scale-[1.02]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/80 hover:translate-x-0.5'
                  }`
                }
              >
                <span className="text-lg">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </NavLink>
              )
            })}
          </nav>
          <div className="px-4 py-4 border-t border-[var(--border-light)] flex items-center justify-between gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)]/60 hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <span className="text-lg">
                {theme === 'light' ? <FiSun /> : <FiMoon />}
              </span>
              <span>{theme === 'light' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-[var(--danger-color)] hover:text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <div className="md:hidden">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold">
                    C
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Consist Control Center
                  </p>
                  <p className="text-sm md:text-base font-semibold text-[var(--text-primary)]">
                    {location.pathname === '/dashboard'
                      ? 'Overview'
                      : location.pathname.startsWith('/content')
                      ? 'Content Intelligence'
                      : location.pathname.startsWith('/teams')
                      ? 'Teams'
                      : location.pathname.startsWith('/users')
                      ? 'Users'
                      : 'Welcome'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={toggleTheme}
                  className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/70 hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <span className="text-lg">
                    {theme === 'light' ? <FiSun /> : <FiMoon />}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-color)] animate-pulse" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="max-w-8xl mx-auto">
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 shadow-xl shadow-[var(--shadow-color)] overflow-hidden">
                {/* animated gradient border */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0_0,rgba(99,102,241,0.18),transparent_55%),radial-gradient(circle_at_100%_0,rgba(6,182,212,0.18),transparent_55%)] animate-pulse blur-xl opacity-70" />
                  <div className="p-4 md:p-6 lg:p-8">{children}</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}


