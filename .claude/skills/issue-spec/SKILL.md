---
name: issue-spec
description: 'Use when drafting a new Glowdex Linear issue from a rough idea, bug report, or feature request. Converts unstructured input into our standard issue format with Context, Outcome, Constraints, and Definition of Done.'
allowed-tools: Read, Grep, Glob
---

# issue-spec

Turn a rough idea, bug report, or feature request into a Linear-ready issue that matches
the Glowdex standard template exactly.

## When to use

The user has an unstructured idea ("we should cache the corpus", "the map flickers on
hover", "add a CSV export") and wants it written up as a proper Linear issue.

## Steps

1. **Check the input is workable before writing anything.** If the input is too thin to
   produce a real Context, Outcome, and Definition of Done, ask **only for the specific
   missing pieces** — do not silently invent scope, acceptance criteria, or constraints.
   Typical gaps worth asking about: what triggered this, what "done" looks like, and any
   scope limits. Ask the minimum number of questions, then proceed. If the input is already
   rich enough, skip straight to output.

2. **Decide whether this is build work at all.** If the request is genuinely a
   decision or research question — no code to write, no mechanically checkable outcome
   possible (e.g. "should we move to Vertex RAG Engine?") — **say so explicitly** and do
   not force it into the template below. Offer to capture it as a research/spike note
   instead, framing the question and what a decision would require.

3. **Output in exactly this structure** (nothing before or after except the label
   suggestion in step 5):

   ```
   ## Context
   [why this exists, what triggered it — the problem, not the solution]

   ## Outcome
   [what "done" looks like as a result / observable end state, NOT a list of
   implementation steps]

   ## Constraints
   [scope limits, timeline, what not to touch, dependencies on other work or repos]

   ## Definition of Done
   - [ ] [mechanically checkable item]
   - [ ] [mechanically checkable item]
   ```

4. **Definition of Done must be mechanically verifiable.** Every item must be something a
   reviewer or CI can confirm without judgment — a file exists, an endpoint returns a given
   shape, a test passes, a value appears in config. **Ban vague items** like "works
   correctly", "is performant", "looks good", "handles errors gracefully". If a criterion
   genuinely cannot be made checkable, **say so** rather than forcing a fake-checkable item —
   list it under Constraints or note it as a reviewer judgment call.

5. **Suggest labels** after the issue body:
   - **Type** — pick exactly one: `Bug`, `Feature`, or `Research`.
   - **Area** — pick what applies from `Frontend`, `Backend`, `Data`, `Infrastructure`.
     More than one is fine; none is fine if genuinely unclear (say so).

   Format: `Suggested labels: Type: <one> · Area: <one or more, or "unclear">`

## Notes

- Keep Outcome about the end state, not the steps to get there — steps belong to whoever
  implements it.
- Prefer fewer, sharper DoD items over a long list of soft ones.
- You may Read/Grep/Glob the repo to ground Context or DoD in real file paths, endpoints,
  or config when it makes an item more checkable — but don't expand scope beyond what the
  user asked for.
