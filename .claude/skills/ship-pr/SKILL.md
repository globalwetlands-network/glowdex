---
name: ship-pr
description: 'Use when a pushed feature branch is ready to become a PR: runs a code review, opens a PR against develop with the template filled in, and requests a Copilot review. Never commits or pushes.'
allowed-tools: Bash, Read, Skill
---

# ship-pr

Take a pushed, in-sync feature branch and ship it for review: run a code review, open (or
update) a PR against `develop` with the repo template filled in, and request a Copilot review.
Fully automated through PR creation — the maintainer's checkpoint is reviewing the open PR
after Copilot's comments land.

This skill **composes** the `/code-review` skill; it does not replace it. It **never commits or
pushes** — the maintainer does that manually.

## When to use

The user has a feature branch whose work is already committed and pushed, and wants it turned
into a reviewed PR in one step. Optional argument: review effort (default `high`), e.g.
`/ship-pr medium`.

## Steps

1. **Preflight — read-only, stop on any failure. Do not mutate anything.**
   - Confirm the current branch is a feature branch, not `develop` or `main`:
     `git rev-parse --abbrev-ref HEAD`. If on `develop`/`main`, stop.
   - Confirm the working tree is clean and the branch is pushed and in sync:
     - `git status --short` must be empty (no uncommitted changes).
     - `git rev-list --left-right --count @{u}...HEAD` must be `0	0` (in sync with upstream).
       If there is no upstream, or it is ahead/behind, **stop** and tell the user to commit and
       push first (the maintainer commits manually — this skill never does).
   - Confirm there are commits to ship vs the base: `git log --oneline develop..HEAD` must be
     non-empty. If empty, stop — nothing to open a PR for.

2. **Self-review.** Invoke the `/code-review` skill (via the Skill tool) at the chosen effort
   on the branch diff against `develop`. Summarize the findings inline for the user. Do **not**
   block on findings — this flow is automated to PR creation. Keep a short "self-review notes"
   summary to fold into the PR body (step 3).

3. **Derive PR inputs.**
   - Base branch: `develop`.
   - Title + tracking: if the branch matches `feature/glo-<n>-<slug>`, derive `GLO-<n>`, title
     `GLO-<n>: <readable title>`, and include a Linear link
     (`https://linear.app/glowdex/issue/GLO-<n>`). For `chore/` or other branches with no Linear
     issue, title from the primary commit subject and mark the Linear/tracking section `N/A` —
     never fabricate a link.
   - Body from `.github/pull_request_template.md` (Read it) — populate **every section the
     template actually defines** (e.g. What & Why, Key Changes, Linear, How to Test, Screenshots
     and Recordings), drawing on `git log develop..HEAD` and the diff, and fold the self-review
     notes from step 2 into the notes section. Drop the template's `# ✨ PR Title` placeholder
     line — the title is passed via `--title`, not the body. Write the body to a temp file and
     pass it with `--body-file`.

4. **Create or update the PR.**
   - If a PR already exists for the branch (`gh pr view --json number,url` succeeds), update its
     body: `gh pr edit <n> --body-file <file>` (and title if it changed).
   - Otherwise create it:
     `gh pr create --base develop --head <branch> --title "<title>" --body-file <file>`.

5. **Request a Copilot review.** Use the REST endpoint (the `--add-reviewer Copilot` flag does
   not work):

   ```
   gh api --method POST \
     "repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pulls/<n>/requested_reviewers" \
     -f "reviewers[]=copilot-pull-request-reviewer[bot]"
   ```

   Then **verify** by checking the PR's reviews/timeline, not `requested_reviewers` (Copilot
   converts the request into an in-progress review, so `requested_reviewers` may read empty even
   on success): `gh pr view <n> --json reviewRequests,reviews`. If Copilot never attaches,
   report the failure and the manual fallback (PR page → Reviewers → Copilot). Do not request a
   human reviewer — the maintainer self-reviews the open PR.

6. **Report.** Output the PR URL, the self-review summary, and the Copilot request status. Note
   that Copilot's review runs asynchronously and may take a few minutes.

## Notes

- **Never commit or push.** If the branch isn't already committed and pushed, stop at preflight
  and hand back to the maintainer.
- Keep no personal names in this skill or the PR body — the maintainer is the human reviewer by
  convention.
- `/code-review` is an upstream plugin; this skill calls it as a step and does not modify it.
- Use `gh` for all GitHub interaction (PR create/edit, reviewer request), not web fetch.
