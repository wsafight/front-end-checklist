#!/usr/bin/env bash
# Validate the skill package structure before release.
# Runs in CI and locally. Exits non-zero on any issue.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_DIR="$ROOT/skills/frontend-checklist"
SKILL_MD="$SKILL_DIR/SKILL.md"
CHECKLIST_MD="$SKILL_DIR/references/checklist.md"

fail() { echo "validate-skill: $1" >&2; exit 1; }

[ -d "$SKILL_DIR" ]      || fail "missing directory: $SKILL_DIR"
[ -f "$SKILL_MD" ]       || fail "missing file: $SKILL_MD"
[ -s "$SKILL_MD" ]       || fail "empty file: $SKILL_MD"
[ -f "$CHECKLIST_MD" ]   || fail "missing file: $CHECKLIST_MD"
[ -s "$CHECKLIST_MD" ]   || fail "empty file: $CHECKLIST_MD"

# Frontmatter must have name and description.
head -n 20 "$SKILL_MD" | grep -qE '^name:[[:space:]]*[^[:space:]]'        || fail "SKILL.md frontmatter missing 'name'"
head -n 20 "$SKILL_MD" | grep -qE '^description:[[:space:]]*[^[:space:]]' || fail "SKILL.md frontmatter missing 'description'"

echo "validate-skill: ok"
