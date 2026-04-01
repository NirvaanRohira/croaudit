// Prompt templates extracted from n8n workflow "CRO Audit - Micro SaaS v1"

export function buildAuditPrompt(
  markdown: string,
  pagespeedData: any,
  checklist: any[],
  pageType: string,
  url: string
): string {
  const pagespeed = pagespeedData || {};

  // Group checklist items by section for the prompt
  const sections: Record<string, any[]> = {};
  for (let i = 0; i < checklist.length; i++) {
    const sec = checklist[i].section || 'General';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(checklist[i]);
  }

  let checklistText = '';
  const sectionNames = Object.keys(sections);
  for (let s = 0; s < sectionNames.length; s++) {
    const secName = sectionNames[s];
    const secItems = sections[secName];
    checklistText += '\n### ' + secName + '\n';
    for (let k = 0; k < secItems.length; k++) {
      const imp = secItems[k].impact ? secItems[k].impact + '/3' : 'N/A';
      checklistText += (k + 1) + '. ' + secItems[k].item + ' [Impact: ' + imp + ']\n';
    }
  }

  // PageSpeed context — use actual PageSpeedResult fields
  let pagespeedContext = '';
  if (pagespeed.performance_score != null || pagespeed.accessibility_score != null) {
    const cwv = pagespeed.core_web_vitals || {};
    const fcp = cwv.fcp != null ? (cwv.fcp / 1000).toFixed(1) + 's' : 'N/A';
    const lcp = cwv.lcp != null ? (cwv.lcp / 1000).toFixed(1) + 's' : 'N/A';
    const tbt = cwv.tbt != null ? Math.round(cwv.tbt) + 'ms' : 'N/A';
    const cls = cwv.cls != null ? cwv.cls.toFixed(3) : 'N/A';
    pagespeedContext = '\n\n## REAL PERFORMANCE DATA (Google PageSpeed Insights - Mobile):\n' +
      '- Performance Score: ' + (pagespeed.performance_score ?? 'N/A') + '/100\n' +
      '- Accessibility Score: ' + (pagespeed.accessibility_score ?? 'N/A') + '/100\n' +
      '- Mobile Friendly: ' + (pagespeed.mobile_friendly ? 'YES' : 'NO') + '\n' +
      '- First Contentful Paint (FCP): ' + fcp + '\n' +
      '- Largest Contentful Paint (LCP): ' + lcp + '\n' +
      '- Total Blocking Time (TBT): ' + tbt + '\n' +
      '- Cumulative Layout Shift (CLS): ' + cls + '\n\n' +
      'Use this data to PASS or FAIL speed/mobile/accessibility items definitively. Do NOT mark these as UNABLE TO VERIFY when data is provided.';
  }

  const contextType =
    'the actual Markdown-rendered content of an existing e-commerce webpage';

  const systemPrompt = 'You are a world-class CRO expert with 15+ years auditing e-commerce stores (Shopify, WooCommerce, BigCommerce).\n\n' +
    'You are analyzing ' + contextType + ' for a **' + pageType + ' Page**.\n\n' +
    'TOTAL CHECKLIST ITEMS TO EVALUATE: ' + checklist.length + '\n\n' +
    'For EACH item, determine:\n' +
    '- **PASS**: Clear evidence the item is implemented\n' +
    '- **FAIL**: Clear evidence it is missing or poor\n' +
    '- **UNABLE TO VERIFY**: Cannot determine (use sparingly)\n\n' +
    'Be specific. Reference exact text/elements from the content. Items with Impact 3/3 are most critical.\n' +
    pagespeedContext + '\n\n' +
    '## CHECKLIST:\n' + checklistText + '\n\n' +
    '## CONTENT TO ANALYZE:\n' + markdown + '\n\n' +
    'Respond in STRICT JSON:\n' +
    '{"audit_results": [{"item": "...", "section": "...", "status": "PASS|FAIL|UNABLE TO VERIFY", "explanation": "...", "impact": 1-3}]}';

  return systemPrompt;
}

export function buildOptimizePrompt(
  auditResults: any[],
  pageType: string,
  markdown: string,
  url: string
): string {
  // auditResults is expected to be the raw audit response string (or stringified)
  const auditResponse = typeof auditResults === 'string'
    ? auditResults
    : JSON.stringify(auditResults);

  const isDescription = false;

  const optimizePrompt = `You are a world-class Conversion Rate Optimization (CRO) expert and creative copywriter.

You just completed an audit of a **${pageType} Page**. Here are the audit results:

${auditResponse}

**Your task:**

For EVERY item that **FAILED** or was **UNABLE TO VERIFY**, generate an "Optimized Demo" showing how to fix or implement it.

Provide:
1. **Better headlines** (if relevant)
2. **Improved copy** (if relevant)
3. **Code snippets** for UI elements (HTML/CSS) if applicable
4. **Specific recommendations** with examples

${isDescription ?
  "Note: Since this is a planned website (not live yet), provide recommendations and examples they can implement when building." :
  "Note: This is an existing website, so provide specific fixes based on what's currently there."}

**OUTPUT FORMAT (JSON):**
\`\`\`json
{
  "optimized_suggestions": [
    {
      "failed_item": "The checklist item that failed",
      "suggestion_title": "Short title for the fix",
      "recommendation": "Detailed explanation of what to do",
      "example": "Concrete example (headline, copy, code snippet, etc.)"
    }
  ]
}
\`\`\`

Provide actionable, creative, and specific optimizations.`;

  return optimizePrompt;
}
