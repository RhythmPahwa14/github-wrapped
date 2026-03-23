'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

function analyze(data) {
  const { commits, totalCommits, repos, yearRepos, langMap, prEvents, issueEvents, starEvents, year } = data
  const hourCount = Array(24).fill(0)
  commits.forEach(c => hourCount[c.hour]++)
  const chaoticHour = hourCount.indexOf(Math.max(...hourCount))
  const dateCounts = {}
  commits.forEach(c => { dateCounts[c.date] = (dateCounts[c.date] || 0) + 1 })
  let longestStreak = 0, streak = 0
  const days = Object.keys(dateCounts).sort()
  days.forEach((d, i) => {
    if (i === 0 || new Date(d) - new Date(days[i - 1]) > 86400000) streak = 1
    else streak++
    longestStreak = Math.max(longestStreak, streak)
  })
  const msgWords = {}
  commits.forEach(c => {
    c.message.toLowerCase().split(/\s+/).forEach(w => {
      const clean = w.replace(/[^a-z]/g, '')
      if (clean.length > 2) msgWords[clean] = (msgWords[clean] || 0) + 1
    })
  })
  const fixScore = ['fix', 'bug', 'patch', 'error', 'typo', 'broken', 'revert', 'hotfix'].reduce((s, w) => s + (msgWords[w] || 0), 0)
  const addScore = ['add', 'feat', 'new', 'create', 'implement', 'initial'].reduce((s, w) => s + (msgWords[w] || 0), 0)
  const refScore = ['refactor', 'clean', 'update', 'rename', 'improve'].reduce((s, w) => s + (msgWords[w] || 0), 0)
  let signatureMove, signatureType, signatureRoast
  if (fixScore >= addScore && fixScore >= refScore) {
    signatureMove = 'The Bug Whisperer'
    signatureType = 'fix'
    signatureRoast = `"fix" appeared ${msgWords['fix'] || 0} times. you do not write code. you apologize to it.`
  } else if (addScore >= refScore) {
    signatureMove = 'The Feature Factory'
    signatureType = 'add'
    signatureRoast = `always shipping. the repo grew by ${yearRepos} new projects. most of which you will never touch again.`
  } else {
    signatureMove = 'The Eternal Refactorer'
    signatureType = 'refactor'
    signatureRoast = 'you did not build software. you reorganized it. the code does the same thing but now the folders spark joy.'
  }
  const sortedLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const totalBytes = sortedLangs.reduce((s, [, v]) => s + v, 0)
  const langData = sortedLangs.map(([name, bytes]) => ({ name, pct: Math.round(bytes / totalBytes * 100) }))
  const neverLearned = ['Rust', 'Go', 'Haskell', 'Elixir', 'Kotlin', 'Scala', 'TypeScript', 'Zig'].filter(l => !langMap[l]).slice(0, 3)
  const hourLabel = h => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`
  const vibeCheck = chaoticHour >= 0 && chaoticHour <= 5 ? 'you code at night. you are the bug.' :
    chaoticHour >= 6 && chaoticHour <= 9 ? 'morning commits. suspiciously productive.' :
    chaoticHour >= 22 ? 'late night grind. classic.' : 'peak hours. you have a schedule. scary.'
  return {
    year, commits: totalCommits || commits.length, repos, yearRepos, prEvents, issueEvents, starEvents,
    chaoticHour, chaoticLabel: hourLabel(chaoticHour), vibeCheck,
    longestStreak, signatureMove, signatureType, signatureRoast,
    langData, neverLearned, hourCount, msgWords,
  }
}

const COLORS = ['#ff6b35', '#f7c59f', '#4ade80', '#60a5fa', '#c084fc', '#fb7185']

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const WrenchIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.47L19 10l-5.12 1.53L12 17l-1.88-5.47L5 10l5.12-1.53L12 3z" />
    <path d="M5 3l.88 2.47L8 6l-2.12.53L5 9l-.88-2.47L2 6l2.12-.53L5 3z" />
    <path d="M19 15l.88 2.47L22 18l-2.12.53L19 21l-.88-2.47L16 18l2.12-.53L19 15z" />
  </svg>
)

const RefactorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const FlameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const S = {

  page: { minHeight: '100vh', fontFamily: "'Exo 2', sans-serif" },
  nav: { borderBottom: '1px solid #141414', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 50 },
  tabs: { borderBottom: '1px solid #141414', padding: '0 28px', display: 'flex', alignItems: 'flex-end', gap: 0, overflowX: 'auto', minHeight: 48 },
  main: { maxWidth: 600, margin: '0 auto', padding: '32px 20px' },
  card: { background: '#000000', border: '1px dotted rgba(255,255,255,0.35)', borderRadius: 16, padding: '28px 24px' },
  eyebrow: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 },
  label: { fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 },
  bigNum: { fontSize: 88, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: '#ffffff', marginBottom: 6 },
  subLabel: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#888', marginBottom: 28 },
  roast: { marginTop: 24, paddingTop: 18, borderTop: '1px solid #141414', fontSize: 14, color: '#666', fontWeight: 600, lineHeight: 1.7 },
  statBox: { background: '#000000', border: '1px dotted rgba(255,255,255,0.35)', borderRadius: 10, padding: '14px 16px' },
  statVal: { fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' },
  statLbl: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#888', marginTop: 4 },
  orangeDot: { width: 6, height: 6, borderRadius: '50%', background: '#ff6b35', display: 'inline-block' },
}

export default function WrappedPage() {
  const { username } = useParams()
  const searchParams = useSearchParams()
  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    fetch(`/api/github?username=${username}&year=${year}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
        setStats(analyze(d))
      })
      .catch(() => setError('something went wrong'))
  }, [username, year])

  const SLIDE_LABELS = ['overview', 'chaos hour', 'streak', 'signature', 'languages', 'share']
  const totalSlides = 6

  if (error) return (
    <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#f87171', fontFamily: "'Space Mono', monospace", fontSize: 13, marginBottom: 16 }}>{error}</p>
      <a href="/" style={{ color: '#ff6b35', fontFamily: "'Space Mono', monospace", fontSize: 12 }}>← go back</a>
    </div>
  )

  if (!stats) return (
    <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #1a1a1a', borderTopColor: '#ff6b35', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 16 }} />
      <p style={{ color: '#444', fontFamily: "'Space Mono', monospace", fontSize: 12 }}>fetching your commits...</p>
      <p style={{ color: '#ff6b35', fontFamily: "'Space Mono', monospace", fontSize: 11, marginTop: 6 }}>judging you silently</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={S.page} className="wrapped-bg">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        ::-webkit-scrollbar { height: 0; }
      `}</style>

      {/* Navbar */}
      <nav style={S.nav}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div className="github-logo" style={{ width: 28, height: 28, background: '#080808', border: '1.5px solid #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f0f0' }}>
  <GitHubIcon />
</div>
            
          <span style={{ fontWeight: 700, fontSize: 14, color: '#f0f0f0', letterSpacing: '-0.02em' }}>GitHub Wrapped</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={data.user.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #222' }} />
          <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#888', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ff6b35'} onMouseLeave={e => e.target.style.color = '#888'}>{username}</a>
          <span className="badge">{year}</span>
        </div>
      </nav>

      {/* Tabs */}
      <div style={S.tabs}>
        {SLIDE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setSlide(i)} style={{ padding: '12px 18px', lineHeight: 1.35, fontFamily: "'Exo 2', sans-serif", fontSize: 12, fontWeight: 600, color: slide === i ? '#ff6b35' : '#888', background: 'transparent', border: 'none', borderBottom: slide === i ? '2px solid #ff6b35' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', marginBottom: -1 }}>
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={S.main} key={slide}>
        <div style={{ animation: 'fadeUp 0.25s ease' }}>
          {slide === 0 && <Slide1 stats={stats} />}
          {slide === 1 && <Slide2 stats={stats} />}
          {slide === 2 && <Slide3 stats={stats} />}
          {slide === 3 && <Slide4 stats={stats} />}
          {slide === 4 && <Slide5 stats={stats} />}
          {slide === 5 && <Slide6 stats={stats} data={data} username={username} />}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0} style={{ background: 'transparent', border: '1px solid #1a1a1a', borderRadius: 8, padding: '8px 18px', color: slide === 0 ? '#444' : '#888', fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: 12, cursor: slide === 0 ? 'not-allowed' : 'pointer' }}>
            ← prev
          </button>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555' }}>{slide + 1} / {totalSlides}</span>
          <button onClick={() => setSlide(s => Math.min(totalSlides - 1, s + 1))} disabled={slide === totalSlides - 1} style={{ background: slide === totalSlides - 1 ? 'transparent' : '#ff6b35', border: '1px solid', borderColor: slide === totalSlides - 1 ? '#1a1a1a' : '#ff6b35', borderRadius: 8, padding: '8px 18px', color: slide === totalSlides - 1 ? '#444' : 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, cursor: slide === totalSlides - 1 ? 'not-allowed' : 'pointer' }}>
            next →
          </button>
        </div>
      </div>
    </div>
  )
}

function Slide1({ stats: s }) {
  return (
    <div style={S.card}>
      <div style={S.eyebrow}><span style={S.orangeDot} /> overview · {s.year}</div>
      <div style={S.label}>total commits</div>
      <div style={S.bigNum}>{s.commits}</div>
      <div style={S.subLabel}>pushes recorded this year</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 4 }}>
        {[['repos', s.repos], ['pull requests', s.prEvents], ['stars given', s.starEvents]].map(([label, val]) => (
          <div key={label} style={S.statBox}>
            <div style={S.statVal}>{val}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>
      <div style={S.roast}>
        {s.commits > 500 ? 'you committed more than you communicated this year.' : s.commits > 100 ? 'solid year. not impressive. not embarrassing.' : s.commits < 20 ? 'this is a cry for help.' : 'you existed on github. that counts.'}
      </div>
      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #141414', fontSize: 12, color: '#777', fontFamily: "'Space Mono', monospace", textAlign: 'center' }}>
        Made with <span style={{ color: '#ff6b35' }}>❤</span> by Rhythm Pahwa & Sandeep Vashishtha
      </div>
    </div>
  )
}

function Slide2({ stats: s }) {
  const max = Math.max(...s.hourCount, 1)
  return (
    <div style={S.card}>
      <div style={S.eyebrow}><ClockIcon /> chaos hour · commit timing</div>
      <div style={S.label}>most chaotic commit hour</div>
      <div style={S.bigNum}>{s.chaoticLabel}</div>
      <div style={{ ...S.subLabel, marginTop: 12 }}>{s.hourCount[s.chaoticHour]} commits at this hour</div>
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 80, marginBottom: 10 }}>
        {s.hourCount.map((v, h) => (
          <div key={h} style={{ flex: 1, height: `${Math.max(3, Math.round(v / max * 76))}px`, background: h === s.chaoticHour ? '#ff6b35' : '#1a1a1a', borderRadius: '2px 2px 0 0' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#888', marginBottom: 4 }}>
        <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
      </div>
      <div style={S.roast}>{s.vibeCheck}</div>
    </div>
  )
}

function Slide3({ stats: s }) {
  const cells = Math.min(Math.max(s.longestStreak * 4, 28), 84)
  return (
    <div style={S.card}>
      <div style={S.eyebrow}><FlameIcon /> streak · discipline check</div>
      <div style={S.label}>longest commit streak</div>
      <div style={S.bigNum}>{s.longestStreak}<span style={{ fontSize: 36, color: '#222', fontWeight: 600 }}>d</span></div>
      <div style={S.subLabel}>{s.longestStreak} consecutive days</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {Array(cells).fill(0).map((_, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: i < s.longestStreak * 2.5 ? '#ff6b35' : i < s.longestStreak * 3.5 ? '#5a2010' : '#141414' }} />
        ))}
      </div>
      <div style={S.roast}>
        {s.longestStreak >= 30 ? 'thirty days straight. either very focused or completely unemployable.' : s.longestStreak >= 14 ? 'two solid weeks. then something happened.' : s.longestStreak >= 7 ? 'a full week. you peaked.' : 'the streak was short. the rest of the year was not.'}
      </div>
    </div>
  )
}

function Slide4({ stats: s }) {
  const topWords = ['fix', 'add', 'feat', 'update', 'refactor', 'bug', 'init', 'merge'].filter(w => s.msgWords[w] > 0)
  const Icon = s.signatureType === 'fix' ? WrenchIcon : s.signatureType === 'add' ? SparkleIcon : RefactorIcon
  return (
    <div style={S.card}>
      <div style={S.eyebrow}><CodeIcon /> signature move · commit archaeology</div>
      <div style={S.label}>you are</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <div style={{ width: 52, height: 52, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon />
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#ffffff' }}>
          {s.signatureMove}
        </div>
      </div>
      <div style={S.subLabel}>based on {s.commits} commit messages</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {topWords.map(w => (
          <div key={w} style={{ background: '#000000', border: '1px solid #1a1a1a', borderRadius: 6, padding: '4px 10px', fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#444' }}>
            {w} <span style={{ color: '#ff6b35' }}>×{s.msgWords[w]}</span>
          </div>
        ))}
      </div>
      <div style={S.roast}>{s.signatureRoast}</div>
    </div>
  )
}

function Slide5({ stats: s }) {
  return (
    <div style={S.card}>
      <div style={S.eyebrow}><CodeIcon /> languages · what you actually wrote</div>
      <div style={S.label}>your stack this year</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
        {s.langData.slice(0, 5).map((l, i) => (
          <div key={l.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: '#888', fontWeight: 600 }}>{l.name}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#888' }}>{l.pct}%</span>
            </div>
            <div style={{ height: 4, background: '#141414', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${l.pct}%`, height: '100%', background: COLORS[i], borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      {s.neverLearned.length > 0 && (
        <div style={{ background: '#000000', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 16px', marginBottom: 4 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#ff6b35', marginBottom: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>said you would learn this year</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {s.neverLearned.map(l => (
              <span key={l} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#888', textDecoration: 'line-through' }}>{l}</span>
            ))}
          </div>
        </div>
      )}
      <div style={S.roast}>{s.langData[0] ? `${s.langData[0].name} at ${s.langData[0].pct}%. it was always going to be ${s.langData[0].name}.` : 'no language data found.'}</div>
    </div>
  )
}

function Slide6({ stats: s, data, username }) {
  const [copied, setCopied] = useState(false)
  const copyStats = () => {
    const text = `my github wrapped ${s.year}\n@${username}\n\n${s.commits} commits · ${s.longestStreak}d streak · ${s.chaoticLabel} chaos hour\n${s.signatureMove}\ntop language: ${s.langData[0]?.name || 'unknown'}`
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <div style={{ background: '#000000', border: '1px solid #1a1a1a', borderRadius: 16, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #141414' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={data.user.avatar_url} alt="" style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid #1a1a1a' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f0f0' }}>@{username}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#888', marginTop: 3 }}>{s.year} wrapped</div>
          </div>
        </div>
        <div style={{ background: '#ff6b35', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: 'white', fontFamily: "'Exo 2', sans-serif", letterSpacing: '0.05em' }}>WRAPPED</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[['commits', s.commits], ['streak', `${s.longestStreak}d`], ['chaos hour', s.chaoticLabel], ['repos', s.repos]].map(([label, val]) => (
          <div key={label} style={S.statBox}>
            <div style={{ ...S.statVal, fontSize: 30 }}>{val}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.statBox, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {s.signatureType === 'fix' ? <WrenchIcon /> : s.signatureType === 'add' ? <SparkleIcon /> : <RefactorIcon />}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#f0f0f0' }}>{s.signatureMove}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#888', marginTop: 2 }}>signature move</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {s.langData.slice(0, 4).map((l, i) => (
          <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#000000', border: '1px solid #1a1a1a', borderRadius: 20, padding: '4px 10px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS[i] }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555' }}>{l.name}</span>
          </div>
        ))}
      </div>
      <button onClick={copyStats} style={{ width: '100%', background: copied ? 'rgba(74,222,128,0.06)' : 'transparent', border: `1px solid ${copied ? '#4ade80' : '#1a1a1a'}`, borderRadius: 8, padding: '11px 0', color: copied ? '#4ade80' : '#555', fontFamily: "'Exo 2', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 10 }}>
        {copied ? '✓ copied to clipboard' : 'copy my wrapped stats ↗'}
      </button>
      <a href="/" style={{ display: 'block', textAlign: 'center', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#888', textDecoration: 'none' }}>← try another username</a>
    </div>
  )
}