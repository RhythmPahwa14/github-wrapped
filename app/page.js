'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(String)
  const [year, setYear] = useState(years[0])
  const router = useRouter()

  const handleGenerate = () => {
    if (!username.trim()) { setError('enter a username first'); return }
    setError('')
    router.push(`/wrapped/${username.trim()}?year=${year}`)
  }

return (
    <div className="grid-bg" style={{ minHeight: '100vh', color: '#f0f0f0', fontFamily: 'Syne, sans-serif' }}> 

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#080808', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#080808', border: '1.5px solid #ff6b35', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff6b35">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>GitHub Wrapped</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {years.map(y => (
            <button key={y} onClick={() => setYear(y)} style={{ padding: '5px 14px', borderRadius: 8, border: year === y ? '1.5px solid #ff6b35' : '1.5px solid #222', background: year === y ? 'rgba(255,107,53,0.1)' : 'transparent', color: year === y ? '#ff6b35' : '#555', fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
              {y}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', padding: '40px 24px', textAlign: 'center' }}>

        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#ff6b35', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24, border: '1px solid #2a1a0a', background: '#130e09', borderRadius: 20, padding: '5px 16px' }}>
          {year} edition
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 9vw, 70px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16, background: 'linear-gradient(135deg, #ffffff 0%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GitHub<br />Wrapped
        </h1>

        <p style={{ fontSize: 16, color: '#555', marginBottom: 40, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          your year in commits
        </p>

        {/* Terminal-style search */}
        <div style={{ width: '100%', maxWidth: 460, background: '#0f0f0f', border: '1px solid #222', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: '#141414', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#333' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#333' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#333' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444', marginLeft: 8 }}>github-wrapped ~ search</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#ff6b35', fontFamily: 'monospace', fontSize: 14, flexShrink: 0 }}>→</span>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f0f0', fontFamily: 'monospace', fontSize: 15, caretColor: '#ff6b35' }}
            />
            <button onClick={handleGenerate} style={{ background: 'linear-gradient(135deg, #ff6b35, #e85a24)', border: 'none', borderRadius: 8, padding: '7px 18px', color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
              Generate ↗
            </button>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 12, marginTop: 12 }}>{error}</p>}

        {/* Stats hint */}
        <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
          {[['commits', 'total pushes'], ['streak', 'consecutive days'], ['chaos hour', 'peak commit time']].map(([label, sub]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#ff6b35', marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#333' }}>{sub}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}