#!/usr/bin/env bash
# Generate a Cursor rule file (.mdc) from SKILL.md + checklist.md.
# Output goes to stdout; caller redirects.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_MD="$ROOT/skills/frontend-checklist/SKILL.md"
CHECKLIST_MD="$ROOT/skills/frontend-checklist/references/checklist.md"

# Strip frontmatter from SKILL.md (lines between the first pair of ---).
skill_body=$(awk '
  BEGIN { in_fm = 0; seen = 0 }
  /^---[[:space:]]*$/ {
    if (seen == 0) { in_fm = 1; seen = 1; next }
    else if (in_fm) { in_fm = 0; next }
  }
  !in_fm { print }
' "$SKILL_MD")

cat <<EOF
---
description: Frontend code review checklist. Trigger on explicit user request only (e.g. "按清单 review", "/frontend-checklist", "review with frontend checklist").
alwaysApply: false
---

$skill_body

---

$(cat "$CHECKLIST_MD")
EOF
