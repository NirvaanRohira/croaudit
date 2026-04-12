import { loadChecklist, type PageType, type ChecklistItem } from './checklist'
import { buildAuditPrompt, buildOptimizePrompt } from './prompts'
import { formatReport, type ReportInput } from './report-formatter'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PageSpeedResult {
  performance_score: number | null
  accessibility_score: number | null
  mobile_friendly: boolean
  core_web_vitals: {
    fcp: number | null  // First Contentful Paint (ms)
    lcp: number | null  // Largest Contentful Paint (ms)
    tbt: number | null  // Total Blocking Time (ms)
    cls: number | null  // Cumulative Layout Shift
  }
}

export interface AuditResultItem {
  item: string
  section: string
  status: 'PASS' | 'FAIL' | 'UNABLE TO VERIFY'
  explanation: string
  impact: number
}

export interface OptimizeSuggestion {
  failed_item: string
  suggestion_title: string
  recommendation: string
  example: string
}

export interface AuditResult {
  score: number
  pass_count: number
  fail_count: number
  unable_count: number
  total_items: number
  audit_results: AuditResultItem[]
  quick_wins: AuditResultItem[]
  suggestions: OptimizeSuggestion[] | null
  pagespeed: PageSpeedResult
  html_report: string
  model_used_audit: string
  model_used_optimize: string | null
}

// ─── Step 1: Fetch page content via Jina AI Reader ──────────────────────────

export async function fetchPageContent(url: string): Promise<string> {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      'Accept': 'text/markdown',
      'X-Return-Format': 'markdown',
    },
  })

  if (!response.ok) {
    throw new Error(`Jina AI Reader failed: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()

  // Truncate if extremely long to stay within LLM context limits
  const MAX_CHARS = 80000
  if (text.length > MAX_CHARS) {
    return text.slice(0, MAX_CHARS) + '\n\n[Content truncated for analysis]'
  }

  return text
}

// ─── Step 2: Fetch PageSpeed data ───────────────────────────────────────────

export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&strategy=mobile`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      console.error(`PageSpeed API error: ${response.status}`)
      return getEmptyPageSpeedResult()
    }

    const data = await response.json()
    return extractPageSpeedMetrics(data)
  } catch (error) {
    console.error('PageSpeed fetch error:', error)
    return getEmptyPageSpeedResult()
  }
}

function extractPageSpeedMetrics(data: Record<string, unknown>): PageSpeedResult {
  const lighthouse = (data as Record<string, Record<string, unknown>>)
    .lighthouseResult as Record<string, unknown> | undefined

  if (!lighthouse) return getEmptyPageSpeedResult()

  const categories = lighthouse.categories as Record<string, { score?: number }> | undefined
  const audits = lighthouse.audits as Record<string, { score?: number; numericValue?: number; displayValue?: string }> | undefined

  const perfScore = categories?.performance?.score
  const a11yScore = categories?.accessibility?.score

  // Extract Core Web Vitals from audits
  const fcp = audits?.['first-contentful-paint']?.numericValue ?? null
  const lcp = audits?.['largest-contentful-paint']?.numericValue ?? null
  const tbt = audits?.['total-blocking-time']?.numericValue ?? null
  const cls = audits?.['cumulative-layout-shift']?.numericValue ?? null

  // Mobile friendly check: viewport meta tag + font size
  const viewport = audits?.['viewport']?.score === 1
  const fontSize = audits?.['font-size']?.score === 1
  const mobileFriendly = viewport && fontSize

  return {
    performance_score: perfScore != null ? Math.round(perfScore * 100) : null,
    accessibility_score: a11yScore != null ? Math.round(a11yScore * 100) : null,
    mobile_friendly: mobileFriendly,
    core_web_vitals: { fcp, lcp, tbt, cls },
  }
}

function getEmptyPageSpeedResult(): PageSpeedResult {
  return {
    performance_score: null,
    accessibility_score: null,
    mobile_friendly: false,
    core_web_vitals: { fcp: null, lcp: null, tbt: null, cls: null },
  }
}

// ─── Step 4: LLM Pass 1 — Audit ────────────────────────────────────────────

async function runAuditLLM(
  markdown: string,
  pagespeed: PageSpeedResult,
  checklist: ChecklistItem[],
  pageType: string,
  url: string,
  isPaidUser: boolean
): Promise<{ results: AuditResultItem[]; model: string }> {
  const prompt = buildAuditPrompt(markdown, pagespeed, checklist, pageType, url)

  if (isPaidUser && process.env.ANTHROPIC_API_KEY) {
    return callAnthropicAudit(prompt)
  } else {
    // Use OpenRouter for both free and paid (when no Anthropic key)
    return callOpenRouterAudit(prompt)
  }
}

async function callAnthropicAudit(prompt: string): Promise<{ results: AuditResultItem[]; model: string }> {
  const model = 'claude-sonnet-4-20250514'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${err}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  const results = parseAuditJSON(text)
  return { results, model }
}

async function callOpenRouterAudit(prompt: string): Promise<{ results: AuditResultItem[]; model: string }> {
  const model = 'google/gemini-2.0-flash-001'

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://croaudit.io',
      'X-Title': 'CROaudit',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${err}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  const results = parseAuditJSON(text)
  return { results, model }
}

// ─── Step 5: LLM Pass 2 — Optimization (paid only) ─────────────────────────

async function runOptimizeLLM(
  auditResults: AuditResultItem[],
  pageType: string,
  markdown: string,
  url: string
): Promise<{ suggestions: OptimizeSuggestion[]; model: string }> {
  const prompt = buildOptimizePrompt(auditResults, pageType, markdown, url)

  // Use Anthropic if key available, otherwise fall back to OpenRouter
  if (process.env.ANTHROPIC_API_KEY) {
    const model = 'claude-sonnet-4-20250514'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Anthropic API error (optimize): ${response.status} - ${err}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const suggestions = parseOptimizeJSON(text)
    return { suggestions, model }
  } else {
    // Fallback to OpenRouter
    const model = 'google/gemini-2.0-flash-001'
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY!}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://croaudit.io',
        'X-Title': 'CROaudit',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenRouter API error (optimize): ${response.status} - ${err}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    const suggestions = parseOptimizeJSON(text)
    return { suggestions, model }
  }
}

// ─── JSON Parsing Helpers ───────────────────────────────────────────────────

function parseAuditJSON(text: string): AuditResultItem[] {
  // Strategy 1: Extract JSON array from markdown code blocks or raw text
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: Record<string, unknown>) => ({
          item: String(item.item || ''),
          section: String(item.section || ''),
          status: normalizeStatus(String(item.status || '')),
          explanation: String(item.explanation || ''),
          impact: Number(item.impact || 1),
        }))
      }
    }
  } catch (error) {
    console.error('Strategy 1 (full array) failed:', error)
  }

  // Strategy 2: Fallback — find individual JSON objects and collect them
  try {
    const objectPattern = /\{[^{}]*"item"\s*:\s*"[^"]*"[^{}]*"status"\s*:\s*"[^"]*"[^{}]*\}/g
    const matches = text.match(objectPattern)
    if (matches && matches.length > 0) {
      console.log(`[parseAuditJSON] Fallback: found ${matches.length} individual objects`)
      const results: AuditResultItem[] = []
      for (const match of matches) {
        try {
          const item = JSON.parse(match) as Record<string, unknown>
          results.push({
            item: String(item.item || ''),
            section: String(item.section || ''),
            status: normalizeStatus(String(item.status || '')),
            explanation: String(item.explanation || ''),
            impact: Number(item.impact || 1),
          })
        } catch {
          // Skip malformed individual objects
        }
      }
      if (results.length > 0) return results
    }
  } catch (error) {
    console.error('Strategy 2 (individual objects) failed:', error)
  }

  console.error('All parsing strategies failed for audit LLM response')
  return []
}

function parseOptimizeJSON(text: string): OptimizeSuggestion[] {
  try {
    // Handle both {optimized_suggestions: [...]} and direct [...] format
    const objMatch = text.match(/\{[\s\S]*"optimized_suggestions"[\s\S]*\}/)
    if (objMatch) {
      const parsed = JSON.parse(objMatch[0])
      if (parsed.optimized_suggestions && Array.isArray(parsed.optimized_suggestions)) {
        return parsed.optimized_suggestions
      }
    }

    const arrMatch = text.match(/\[[\s\S]*\]/)
    if (arrMatch) {
      const parsed = JSON.parse(arrMatch[0])
      if (Array.isArray(parsed)) return parsed
    }
  } catch (error) {
    console.error('Failed to parse optimize LLM response:', error)
  }
  return []
}

function normalizeStatus(status: string): 'PASS' | 'FAIL' | 'UNABLE TO VERIFY' {
  const upper = status.toUpperCase().trim()
  if (upper === 'PASS') return 'PASS'
  if (upper === 'FAIL') return 'FAIL'
  return 'UNABLE TO VERIFY'
}

// ─── Step 6: Score and format ───────────────────────────────────────────────

function computeScore(results: AuditResultItem[]) {
  const pass_count = results.filter(r => r.status === 'PASS').length
  const fail_count = results.filter(r => r.status === 'FAIL').length
  const unable_count = results.filter(r => r.status === 'UNABLE TO VERIFY').length
  const total_items = results.length

  // Score = pass / (pass + fail), excluding "UNABLE TO VERIFY"
  // This matches how most audit tools score — unverifiable items don't penalize
  const verifiable = pass_count + fail_count
  const score = verifiable > 0 ? Math.round((pass_count / verifiable) * 100) : 0

  // Quick wins: top 5 failures sorted by impact (highest first)
  const quick_wins = results
    .filter(r => r.status === 'FAIL')
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)

  return { score, pass_count, fail_count, unable_count, total_items, quick_wins }
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

export async function runAudit(
  pageUrl: string,
  pageType: PageType,
  isPaidUser: boolean
): Promise<AuditResult> {
  // Step 1 & 2: Parallel fetch
  const [markdown, pagespeed] = await Promise.all([
    fetchPageContent(pageUrl),
    fetchPageSpeed(pageUrl),
  ])

  // Step 3: Load checklist
  const checklist = loadChecklist(pageType)

  // Step 4: LLM Pass 1 — Audit
  const { results: auditResults, model: auditModel } = await runAuditLLM(
    markdown, pagespeed, checklist, pageType, pageUrl, isPaidUser
  )

  // Guard: If LLM response parsing yielded zero items, fail the audit
  if (auditResults.length === 0) {
    throw new Error('LLM response parsing failed — no audit items extracted. The model may have returned an unexpected format.')
  }

  // Step 5: LLM Pass 2 — Optimization (paid users only)
  let suggestions: OptimizeSuggestion[] | null = null
  let optimizeModel: string | null = null
  if (isPaidUser) {
    const optimizeResult = await runOptimizeLLM(auditResults, pageType, markdown, pageUrl)
    suggestions = optimizeResult.suggestions
    optimizeModel = optimizeResult.model
  }

  // Step 6: Score and format
  const scores = computeScore(auditResults)

  const reportInput: ReportInput = {
    url: pageUrl,
    pageType,
    isDescription: false,
    auditData: { audit_results: auditResults as unknown as import('./report-formatter').AuditResultItem[] },
    optimizeData: suggestions
      ? { optimized_suggestions: suggestions as unknown as import('./report-formatter').OptimizedSuggestion[] }
      : { optimized_suggestions: [] },
    pagespeed: {
      pagespeed_available: pagespeed.performance_score != null,
      performance_score: pagespeed.performance_score ?? undefined,
      accessibility_score: pagespeed.accessibility_score ?? undefined,
      mobile_friendly: pagespeed.mobile_friendly,
      core_web_vitals: {
        fcp: pagespeed.core_web_vitals.fcp?.toString(),
        lcp: pagespeed.core_web_vitals.lcp?.toString(),
        tbt: pagespeed.core_web_vitals.tbt?.toString(),
        cls: pagespeed.core_web_vitals.cls?.toString(),
      },
    },
  }

  const report = formatReport(reportInput)

  return {
    score: scores.score,
    pass_count: scores.pass_count,
    fail_count: scores.fail_count,
    unable_count: scores.unable_count,
    total_items: scores.total_items,
    audit_results: auditResults,
    quick_wins: scores.quick_wins,
    suggestions,
    pagespeed,
    html_report: report.html_report,
    model_used_audit: auditModel,
    model_used_optimize: optimizeModel,
  }
}

/**
 * Run only LLM Pass 2 on existing audit results (for when free user upgrades).
 */
export async function runOptimizeOnly(
  auditResults: AuditResultItem[],
  pageType: string,
  pageUrl: string,
  markdown?: string
): Promise<{ suggestions: OptimizeSuggestion[]; model: string }> {
  const content = markdown || ''
  return runOptimizeLLM(auditResults, pageType, content, pageUrl)
}
