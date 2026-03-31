// report-formatter.ts
// Translated from the n8n "Format HTML Report" Code node (v4 enhanced)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditStatus = "PASS" | "FAIL" | "UNABLE TO VERIFY";

export interface AuditResultItem {
  item: string;
  status: AuditStatus;
  section?: string;
  impact?: number; // 0-3
  explanation?: string;
  observation?: string;
}

export interface CoreWebVitals {
  fcp?: string;
  lcp?: string;
  tbt?: string;
  cls?: string;
}

export interface PageSpeedData {
  pagespeed_available?: boolean;
  performance_score?: number;
  accessibility_score?: number;
  mobile_friendly?: boolean;
  core_web_vitals?: CoreWebVitals;
}

export interface OptimizedSuggestion {
  suggestion_title?: string;
  title?: string;
  failed_item?: string;
  item?: string;
  recommendation?: string;
  description?: string;
  example?: string;
  code_snippet?: string;
}

export interface AuditResults {
  audit_results?: AuditResultItem[];
}

export interface OptimizedSuggestions {
  optimized_suggestions?: OptimizedSuggestion[];
  suggestions?: OptimizedSuggestion[];
}

export interface ReportInput {
  pageType: string;
  url: string;
  isDescription: boolean;
  pagespeed: PageSpeedData;
  auditData: string | AuditResults;
  optimizeData: string | OptimizedSuggestions;
}

export interface ReportSummary {
  page_type: string;
  url: string;
  is_description: boolean;
  overall_score: number;
  total_items: number;
  pass_count: number;
  fail_count: number;
  unable_count: number;
  performance_score: number | null;
  accessibility_score: number | null;
  mobile_friendly: boolean | null;
  sections_evaluated: number;
  quick_wins_count: number;
}

export interface ReportOutput {
  html_report: string;
  email_subject: string;
  summary: ReportSummary;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeParse<T>(data: string | T, fallback: T): T {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }
  return data ?? fallback;
}

function escapeHtml(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function scoreColor(score: number): string {
  if (score >= 70) return "#2ecc71";
  if (score >= 40) return "#f39c12";
  return "#e74c3c";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Good";
  if (score >= 40) return "Needs Work";
  return "Critical";
}

function metricColor(value: number): string {
  if (value >= 90) return "#2ecc71";
  if (value >= 50) return "#f39c12";
  return "#e74c3c";
}

function impactDots(impact: number | undefined): string {
  if (!impact) return "";
  return "\u25CF".repeat(impact) + "\u25CB".repeat(3 - impact);
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildPageSpeedHTML(pagespeed: PageSpeedData): string {
  if (!pagespeed.pagespeed_available) return "";

  const cwv = pagespeed.core_web_vitals ?? {};
  const perfColor = metricColor(pagespeed.performance_score ?? 0);
  const a11yColor = metricColor(pagespeed.accessibility_score ?? 0);
  const mobileColor = pagespeed.mobile_friendly ? "#2ecc71" : "#e74c3c";

  return `
    <h2>⚡ Performance Metrics (Google PageSpeed - Mobile)</h2>
    <div class="summary">
      <div class="summary-item" style="background-color: ${perfColor}">
        <h3>${pagespeed.performance_score ?? "N/A"}</h3>
        <p>Performance</p>
      </div>
      <div class="summary-item" style="background-color: ${a11yColor}">
        <h3>${pagespeed.accessibility_score ?? "N/A"}</h3>
        <p>Accessibility</p>
      </div>
      <div class="summary-item" style="background-color: ${mobileColor}">
        <h3>${pagespeed.mobile_friendly ? "\u2713" : "\u2717"}</h3>
        <p>Mobile Ready</p>
      </div>
    </div>
    <div class="meta-info" style="display: flex; flex-wrap: wrap; gap: 10px;">
      <span><strong>FCP:</strong> ${cwv.fcp ?? "N/A"}</span>
      <span><strong>LCP:</strong> ${cwv.lcp ?? "N/A"}</span>
      <span><strong>TBT:</strong> ${cwv.tbt ?? "N/A"}</span>
      <span><strong>CLS:</strong> ${cwv.cls ?? "N/A"}</span>
    </div>
  `;
}

function buildQuickWinsHTML(quickWins: AuditResultItem[]): string {
  if (quickWins.length === 0) return "";

  const items = quickWins
    .map(
      (item, i) => `
      <div class="audit-item fail-item" style="border-left-width: 6px;">
        <span class="status-badge status-fail">#${i + 1} HIGH IMPACT</span>
        <strong>${item.item}</strong>
        <span class="impact-dots">${impactDots(item.impact)}</span>
        <p>${item.explanation ?? item.observation ?? ""}</p>
      </div>
    `,
    )
    .join("");

  return `
    <h2>\uD83D\uDE80 Quick Wins (Fix These First)</h2>
    <p style="color: #7f8c8d; margin-bottom: 15px;">Highest-impact failures that should be prioritized</p>
    ${items}
  `;
}

function buildFindingsHTML(
  sectionMap: Record<string, AuditResultItem[]>,
): string {
  let html = "";

  for (const secName of Object.keys(sectionMap)) {
    const secItems = sectionMap[secName];
    const secPass = secItems.filter((r) => r.status === "PASS").length;
    const secFail = secItems.filter((r) => r.status === "FAIL").length;

    html += `
      <div class="section-header">
        <h3>${secName}</h3>
        <span class="section-count">${secPass} passed / ${secFail} failed / ${secItems.length} total</span>
      </div>
    `;

    for (const item of secItems) {
      const statusClass =
        item.status === "PASS"
          ? "pass-item"
          : item.status === "FAIL"
            ? "fail-item"
            : "unable-item";
      const badgeClass =
        item.status === "PASS"
          ? "status-pass"
          : item.status === "FAIL"
            ? "status-fail"
            : "status-unable";
      const dots = impactDots(item.impact);

      html += `
        <div class="audit-item ${statusClass}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div>
              <span class="status-badge ${badgeClass}">${item.status}</span>
              <strong>${item.item}</strong>
            </div>
            ${dots ? `<span class="impact-dots" title="Impact: ${item.impact}/3">${dots}</span>` : ""}
          </div>
          <p>${item.explanation ?? item.observation ?? ""}</p>
        </div>
      `;
    }
  }

  return html;
}

function buildSuggestionsHTML(suggestions: OptimizedSuggestion[]): string {
  if (suggestions.length === 0) return "";

  const items = suggestions
    .map((s) => {
      const exampleText = s.example ?? s.code_snippet ?? "";
      const exampleBlock = exampleText
        ? `
            <p><strong>Example:</strong></p>
            <div class="example">${escapeHtml(exampleText)}</div>
          `
        : "";

      return `
        <div class="suggestion">
          <h4>\uD83D\uDD27 ${s.suggestion_title ?? s.title ?? "Recommendation"}</h4>
          <p><strong>Issue:</strong> ${s.failed_item ?? s.item ?? ""}</p>
          <p><strong>Recommendation:</strong> ${s.recommendation ?? s.description ?? ""}</p>
          ${exampleBlock}
        </div>
      `;
    })
    .join("");

  return `
    <h2>\uD83D\uDCA1 Optimized Demo & Recommendations</h2>
    <p>Here are specific, actionable recommendations to fix the issues identified above:</p>
    ${items}
  `;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function formatReport(input: ReportInput): ReportOutput {
  const { pageType, isDescription, pagespeed } = input;
  const url = input.url || "N/A (Description-based audit)";

  // Parse data safely
  const auditResults = safeParse<AuditResults>(input.auditData, {
    audit_results: [],
  });
  const optimizedSuggestions = safeParse<OptimizedSuggestions>(
    input.optimizeData,
    { optimized_suggestions: [] },
  );

  const auditList = auditResults.audit_results ?? [];
  const suggestionsList =
    optimizedSuggestions.optimized_suggestions ??
    optimizedSuggestions.suggestions ??
    [];

  // Counts & score
  const passCount = auditList.filter((i) => i.status === "PASS").length;
  const failCount = auditList.filter((i) => i.status === "FAIL").length;
  const unableCount = auditList.filter(
    (i) => i.status === "UNABLE TO VERIFY",
  ).length;
  const totalItems = auditList.length;
  const overallScore =
    totalItems > 0 ? Math.round((passCount / totalItems) * 100) : 0;
  const sColor = scoreColor(overallScore);
  const sLabel = scoreLabel(overallScore);

  // Group by section
  const sectionMap: Record<string, AuditResultItem[]> = {};
  for (const item of auditList) {
    const sec = item.section ?? "General";
    if (!sectionMap[sec]) sectionMap[sec] = [];
    sectionMap[sec].push(item);
  }

  // Quick wins: high-impact failures
  const quickWins = auditList
    .filter((r) => r.status === "FAIL" && (r.impact ?? 0) >= 2)
    .sort((a, b) => (b.impact ?? 0) - (a.impact ?? 0))
    .slice(0, 5);

  // Build HTML sections
  const pagespeedHTML = buildPageSpeedHTML(pagespeed);
  const quickWinsHTML = buildQuickWinsHTML(quickWins);
  const findingsHTML = buildFindingsHTML(sectionMap);
  const suggestionsHTML = buildSuggestionsHTML(suggestionsList);
  const sectionCount = Object.keys(sectionMap).length;

  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-left: 4px solid #3498db;
      padding-left: 10px;
    }
    .meta-info {
      background-color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .meta-info p { margin: 5px 0; }
    .score-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 4px solid ${sColor};
      float: right;
      text-align: center;
      margin-left: 20px;
    }
    .score-circle .score-num {
      font-size: 28px;
      font-weight: bold;
      color: ${sColor};
      line-height: 1;
    }
    .score-circle .score-label {
      font-size: 10px;
      color: #7f8c8d;
      text-transform: uppercase;
    }
    .summary {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      text-align: center;
    }
    .summary-item {
      flex: 1;
      padding: 15px;
      border-radius: 5px;
      margin: 0 10px;
      color: white;
    }
    .summary-item h3 { margin: 0; font-size: 28px; }
    .summary-item p { margin: 5px 0 0; font-size: 14px; }
    .pass { background-color: #2ecc71; }
    .fail { background-color: #e74c3c; }
    .unable { background-color: #f39c12; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 25px;
      padding: 10px 15px;
      background: #ecf0f1;
      border-radius: 5px;
    }
    .section-header h3 { margin: 0; color: #2c3e50; font-size: 16px; }
    .section-count { font-size: 12px; color: #7f8c8d; }
    .audit-item {
      background-color: #f9f9f9;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      border-left: 4px solid #bdc3c7;
    }
    .audit-item.pass-item { border-left-color: #2ecc71; }
    .audit-item.fail-item { border-left-color: #e74c3c; }
    .audit-item.unable-item { border-left-color: #f39c12; }
    .audit-item p { margin: 5px 0 0; color: #555; font-size: 14px; }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 8px;
      color: white;
    }
    .status-pass { background-color: #2ecc71; }
    .status-fail { background-color: #e74c3c; }
    .status-unable { background-color: #f39c12; }
    .impact-dots {
      font-size: 14px;
      color: #f39c12;
      letter-spacing: 2px;
    }
    .suggestion {
      background-color: #e8f8f5;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      border-left: 4px solid #1abc9c;
    }
    .suggestion h4 { color: #16a085; margin-top: 0; }
    .example {
      background-color: #2c3e50;
      color: #ecf0f1;
      padding: 10px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      overflow-x: auto;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      color: #7f8c8d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="score-circle">
      <div>
        <div class="score-num">${overallScore}</div>
        <div class="score-label">${sLabel}</div>
      </div>
    </div>
    <h1>\uD83C\uDFAF E-commerce CRO Audit Report</h1>

    <div class="meta-info">
      <p><strong>Page Type:</strong> ${pageType}</p>
      <p><strong>Audit Type:</strong> ${isDescription ? "Planned Website (Description-based)" : "Existing Website"}</p>
      <p><strong>URL:</strong> ${url}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Items Evaluated:</strong> ${totalItems} (${sectionCount} sections)</p>
    </div>

    <div class="summary">
      <div class="summary-item pass">
        <h3>${passCount}</h3>
        <p>PASS</p>
      </div>
      <div class="summary-item fail">
        <h3>${failCount}</h3>
        <p>FAIL</p>
      </div>
      <div class="summary-item unable">
        <h3>${unableCount}</h3>
        <p>UNABLE TO VERIFY</p>
      </div>
    </div>

    ${pagespeedHTML}

    ${quickWinsHTML}

    <h2>\uD83D\uDCCB Detailed Audit Results</h2>
    <p style="color: #7f8c8d;">Grouped by section with impact indicators (\u25CF\u25CF\u25CF = high impact)</p>
    ${findingsHTML}

    ${suggestionsHTML}

    <div class="footer">
      <p>\uD83E\uDD16 Generated with AI-powered CRO Analysis</p>
      <p>${totalItems} criteria evaluated across ${sectionCount} sections</p>
      <p>Need help implementing these recommendations? Let's chat!</p>
    </div>
  </div>
</body>
</html>
`;

  const emailSubject = `\uD83C\uDFAF CRO Audit: ${pageType} Page ${overallScore}/100 (${totalItems} checks) - ${isDescription ? "Planned Site" : url}`;

  return {
    html_report: htmlReport,
    email_subject: emailSubject,
    summary: {
      page_type: pageType,
      url,
      is_description: isDescription,
      overall_score: overallScore,
      total_items: totalItems,
      pass_count: passCount,
      fail_count: failCount,
      unable_count: unableCount,
      performance_score: pagespeed.performance_score ?? null,
      accessibility_score: pagespeed.accessibility_score ?? null,
      mobile_friendly: pagespeed.mobile_friendly ?? null,
      sections_evaluated: sectionCount,
      quick_wins_count: quickWins.length,
    },
  };
}
