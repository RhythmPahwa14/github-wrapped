import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  const year = parseInt(searchParams.get('year') || new Date().getFullYear())

  if (!username) {
    return NextResponse.json({ error: 'username required' }, { status: 400 })
  }

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'github-wrapped-app',
      ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }),
    }

    const searchHeaders = {
      'Accept': 'application/vnd.github.cloak-preview+json',
      'User-Agent': 'github-wrapped-app',
      ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }),
    }

    // fetch user
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers })
    if (!userRes.ok) return NextResponse.json({ error: 'user not found' }, { status: 404 })
    const user = await userRes.json()

    // fetch events for hour analysis and commit messages (fetch 30 pages for comprehensive data)
    let allEvents = []
    try {
      for (let page = 1; page <= 30; page++) {
        const r = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`, { headers })
        if (!r.ok) break
        const ev = await r.json()
        if (!Array.isArray(ev) || !ev.length) break
        allEvents = allEvents.concat(ev)
      }
    } catch (e) {}

    const yearEvents = allEvents.filter(e => new Date(e.created_at).getFullYear() === year)
    const pushEvents = yearEvents.filter(e => e.type === 'PushEvent')

    let eventCommits = []
    pushEvents.forEach(e => {
      (e.payload.commits || []).forEach(c => {
        eventCommits.push({
          message: c.message,
          hour: new Date(e.created_at).getHours(),
          date: e.created_at.slice(0, 10),
        })
      })
    })

    // fetch commit dates via search API for accurate streak
    let totalCommits = eventCommits.length
    let searchCommits = []

    try {
      const firstRes = await fetch(
        `https://api.github.com/search/commits?q=author:${username}+author-date:${year}-01-01..${year}-12-31&per_page=100&page=1&sort=author-date`,
        { headers: searchHeaders }
      )
      if (firstRes.ok) {
        const firstData = await firstRes.json()
        totalCommits = firstData.total_count || eventCommits.length

        const pages = Math.min(Math.ceil(totalCommits / 100), 10)
        const pageResults = await Promise.all(
          Array.from({ length: pages }, (_, i) =>
            fetch(
              `https://api.github.com/search/commits?q=author:${username}+author-date:${year}-01-01..${year}-12-31&per_page=100&page=${i + 1}&sort=author-date`,
              { headers: searchHeaders }
            ).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] }))
          )
        )

        pageResults.forEach(data => {
          (data.items || []).forEach(item => {
            const dateStr = item.commit?.author?.date
            if (dateStr) {
              searchCommits.push({
                date: dateStr.slice(0, 10),
                hour: new Date(dateStr).getHours(),
                message: item.commit?.message || '',
              })
            }
          })
        })
      }
    } catch (e) {}

    // use search commits if available, else fall back to events
    const commits = searchCommits.length > 0 ? searchCommits : eventCommits

    // fetch repos and languages
    let repos = []
    try {
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers })
      if (reposRes.ok) repos = await reposRes.json()
    } catch (e) {}

    const langMap = {}
    try {
      await Promise.all(repos.slice(0, 12).map(async repo => {
        try {
          const lr = await fetch(repo.languages_url, { headers })
          if (!lr.ok) return
          const langs = await lr.json()
          Object.entries(langs).forEach(([l, bytes]) => {
            langMap[l] = (langMap[l] || 0) + bytes
          })
        } catch (e) {}
      }))
    } catch (e) {}

    // fetch PR count via search API for accuracy
    let prEvents = yearEvents.filter(e => e.type === 'PullRequestEvent').length
    let starEvents = yearEvents.filter(e => e.type === 'WatchEvent').length

    try {
      const prRes = await fetch(
        `https://api.github.com/search/issues?q=author:${username}+type:pr+created:${year}-01-01..${year}-12-31&per_page=1`,
        { headers }
      )
      if (prRes.ok) {
        const prData = await prRes.json()
        if (prData.total_count > 0) prEvents = prData.total_count
      }
    } catch (e) {}

    // fetch starred repos and count by starred_at year (works across all years)
    try {
      const starHeaders = {
        ...headers,
        'Accept': 'application/vnd.github.v3.star+json',
      }

      let starredCountForYear = 0
      for (let page = 1; page <= 20; page++) {
        const starredRes = await fetch(
          `https://api.github.com/users/${username}/starred?per_page=100&page=${page}&sort=created&direction=desc`,
          { headers: starHeaders }
        )
        if (!starredRes.ok) break

        const starred = await starredRes.json()
        if (!Array.isArray(starred) || starred.length === 0) break

        for (const item of starred) {
          const starredAt = item?.starred_at
          if (!starredAt) continue

          const starredYear = new Date(starredAt).getFullYear()
          if (starredYear === year) starredCountForYear++
        }

        const lastStarredAt = starred[starred.length - 1]?.starred_at
        if (lastStarredAt && new Date(lastStarredAt).getFullYear() < year) break
      }

      starEvents = starredCountForYear
    } catch (e) {}

    return NextResponse.json({
      user,
      commits,
      totalCommits,
      repos: repos.length,
      yearRepos: repos.filter(r => new Date(r.created_at).getFullYear() === year).length,
      langMap,
      prEvents,
      issueEvents: yearEvents.filter(e => e.type === 'IssuesEvent').length,
      starEvents,
      year,
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'failed to fetch data' }, { status: 500 })
  }
}