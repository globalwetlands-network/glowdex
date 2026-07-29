---
name: pr-review
description: "Use when reviewing a pull request or diff against its Linear issue's Definition of Done. Checks compliance against the DoD rather than offering general code opinions."
allowed-tools: Read, Bash, Grep, Glob
---

# pr-review

Review a diff against its linked issue's Definition of Done, as a reviewer with **fresh
context** — not the session that wrote the code. Assume nothing about intent that isn't in
the diff or the issue.

## When to use

The user wants a PR or diff checked for whether it actually satisfies its Linear issue's
Definition of Done — not a general code critique.

## Steps

1. **Gather the two inputs.**
   - **The diff.** Get it from the PR or working tree, e.g. `git diff main...HEAD`,
     `git diff --staged`, or a PR number via `gh pr diff <n>` if the user gives one.
   - **The linked issue's Definition of Done.** Ask the user for the issue or its DoD if
     it isn't already provided. Do not invent DoD items — if you can't get the DoD, stop
     and say so; there is nothing to review against.

2. **Go through the DoD item by item.** For each item, state exactly one of:
   - **Met** — the diff satisfies it (cite the file/line or change that does).
   - **Not met** — the diff does not satisfy it (say what's missing).
   - **Can't verify from the diff alone** — the item is about something not visible in the
     diff (e.g. runtime behavior, an external dashboard, a manual step).

   One line of reasoning per item. Format as a checklist mirroring the DoD.

3. **Flag scope creep.** List any changes in the diff that are **not covered by any DoD
   item** — new files, refactors, dependency bumps, unrelated edits. Neutral listing, not
   judgment: the point is visibility.

4. **Flag unverifiable claims.** Call out DoD items that assert something the diff can't
   substantiate — e.g. "tests pass" when no test file or CI output is present in the diff,
   or "endpoint returns X" with no test or handler change shown. Name what evidence would
   be needed to move it from "can't verify" to "met".

5. **Stay strictly in scope.** Do **not** offer stylistic opinions, alternative
   implementations, refactoring suggestions, or praise. No "nice work", no "consider
   using X instead". Only DoD compliance and scope creep.

6. **End with a single verdict**, on its own line:
   - `Verdict: Ready to merge` — every DoD item is Met (or legitimately Met-pending-manual
     with the reviewer's sign-off noted), and no blocking scope creep.
   - `Verdict: Blocked` — followed by a numbered list of **exactly what is blocking**: each
     unmet DoD item and each unverifiable claim that must be resolved. Nothing else.

## Notes

- "Can't verify from the diff alone" is a first-class outcome — use it rather than guessing.
  It does not by itself block merge unless the DoD item is load-bearing and no evidence
  exists anywhere.
- Read files referenced by the diff for context, but review the **change**, not the whole
  codebase.
- Use `Bash` for read-only git/gh inspection (`git diff`, `git log`, `gh pr diff/view`),
  not to run or mutate anything.
