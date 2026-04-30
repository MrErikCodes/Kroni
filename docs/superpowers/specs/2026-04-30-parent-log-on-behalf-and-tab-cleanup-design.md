# Parent log-on-behalf + tab cleanup — design

Date: 2026-04-30
Status: Approved (brainstorming), pre-implementation
Scope: Mobile app (parent role), API, shared types, i18n

## Problem

Two issues observed in the parent app today:

1. **Phoneless kids cannot have tasks credited.** Today only the kid can call `kidApi.completeTask`. Households where the kid does not own a phone — or where the parent simply runs the day-to-day — have no first-class way to credit a chore. The only adjacent affordance is the "Juster saldo" modal on the kid detail page, which is unrelated to a specific task and bypasses task history.
2. **Bottom tab bar is overcrowded.** The parent role has 5 tabs (`Barn · Oppgaver · Belønninger · Godkjenninger · Innstillinger`). On standard phone widths the *Godkjenninger* label truncates to "Godkjenni…". Settings is a rare-visit destination that does not earn a permanent slot.

## Goals

- Let a parent mark a task done on behalf of one or more kids in the same household, in as few taps as possible.
- Reduce the parent tab bar from 5 to 4 tabs without losing access to any feature.
- Keep the kid's experience natural for households where the kid does have a phone — a parent-logged completion should look the same as a kid-tapped, parent-approved one.

## Non-goals

- Per-kid task assignment (e.g. "this chore only applies to Ada"). All active household tasks are available to all kids, matching today's behavior.
- Co-parent invites ("Inviter forelder"). The Settings *Husstand* section will hold the placeholder, but the relation/invite model is not built here.
- A kid-detail entry point ("Logg oppgave for Ada" button on the kid page). Considered and dropped — *Oppgaver* tab Logg mode is enough.
- Reworking the approval flow for kid-initiated completions. That stays exactly as-is.

## Decisions

- **Authority:** parent-logged completions credit the kid's balance immediately. No approval step. Parents are already the authority; routing through a queue they would self-approve is friction.
- **Entry point:** task-first, not kid-first. Households with multiple kids think "who did this chore today?", and one task can apply to many kids in a single action.
- **Mode toggle:** the *Oppgaver* tab gets a "Logg" mode toggle alongside the existing "+" add button, rather than a per-row "Logg" pill (avoids row clutter) or a separate page (avoids navigation overhead). Designed for the nightly check-in: parent enters Logg, taps each chore that happened, exits.
- **Multi-kid in one tap:** the kid picker sheet is multi-select. One tap on a task → check the kids it applies to → submit credits each kid separately.
- **Settings demoted to gear icon:** Innstillinger leaves the tab bar and lives as a stack-pushed page reachable from a gear icon in the *Barn* tab header. Settings is rarely visited; the badge-bearing *Godkjenninger* tab earns its slot more.
- **Add-kid moves to Settings:** the "+" on the *Barn* tab header is removed. "Legg til barn" lives under a *Husstand* section in Settings. Empty-state CTA still covers the first-add case when zero kids exist.

## Final tab bar

```
Barn · Oppgaver · Belønninger · Godkjenninger
```

Gear icon top-right of the *Barn* tab header opens Settings. *Barn* tab header has no "+" button.

## Mobile UX — Logg mode

### Header

The *Oppgaver* tab header keeps the gold "+" pill (frequent action: parents add new tasks regularly during the first weeks of use). It adds a second button to the left of the "+": a circular outlined button with a `ListChecks` lucide icon, accessibility label from `parent.tasksList.logMode`. The two buttons sit side-by-side at the existing 44×44 size.

### Entering Logg mode

Tapping the Logg button toggles the tab into a visually distinct state:

- The serif headline swaps from "Hvilke oppgaver?" to "Hva er gjort?" using the existing italic-emphasis treatment (display + displayItalic split on the keyword).
- The Logg button transforms into an "Avslutt" button (ghost variant, same 44×44 slot) that exits Logg mode. The "+" button is hidden during Logg mode — adding new tasks while logging is mode-confusing and parents who need to add can exit first.
- Each task row's tap behavior changes: instead of routing to `/(parent)/tasks/[id]`, tapping opens the kid-picker sheet for that task.
- A single visual cue communicates the mode shift: rows get a hairline gold-300 left border (4px wide) so the new tappable affordance reads at a glance without a banner.
- Inactive tasks (`active: false`) and tasks not eligible today (recurrence/days-of-week rules) are hidden, mirroring what the kid sees on their Today screen.

### Kid picker sheet

Opens from the bottom using the existing `Sheet` component. Lists every kid in the household whose row is enabled if they have not already been credited for this task today. Each kid row:

- Avatar (existing component) + name (KroniText `h2`)
- A 28×28 checkbox to the right using lucide `Square` (unchecked) / `CheckSquare2` (checked), gold-500 fill on checked state
- Disabled rows show a small `Badge` "Ferdig" instead of the checkbox, opacity 0.55

Top of sheet: eyebrow "Marker fullført", display headline "Hvem gjorde *{task.title}*?" (italic on title).

Below the kid list: a soft caption "Saldoen krediteres umiddelbart — ingen godkjenning nødvendig." Reassures the parent that the action is committed.

Bottom CTA: a primary `Button` with running tally — "Marker som fullført (2)" using `parent.tasksList.kidPickerCta` with `{count}` interpolation. Disabled when zero kids selected.

### One-kid shortcut

If the household has exactly one kid, the kid picker is skipped entirely. Tapping a task row in Logg mode credits that kid directly with a brief gold flash + light haptic, no sheet. Most single-kid households stay at one tap per task.

### Confirmation

After a successful submit:

- The sheet closes.
- A success haptic fires (`Haptics.NotificationFeedbackType.Success`).
- The just-credited task row dims to 0.55 opacity for ~1.5s and shows a small inline caption "Ferdig for Ada, Bob" (`parent.tasksList.creditedFor` with `{names}`), then disappears from the Logg list.
- No modal interruption. No celebrate screen for the parent (kid-only).

### Error handling

- Network failure → reuse the inline-banner pattern from the kid Today screen (`mutationError`). Selection is preserved so the parent can retry without re-checking kids.
- 409 `alreadyCompleted` for a kid → that kid moves to the disabled "Ferdig" state on retry, the rest of the credits land normally; banner names the affected kid.
- 5xx → generic error banner with retry; selection preserved.

## Backend

### New endpoint

```
POST /parent/tasks/:taskId/log-completion
```

Body:

```json
{
  "kidIds": ["kid_…", "kid_…"],
  "idempotencyKey": "uuid-v4"
}
```

Response 200:

```json
{
  "credited": [
    { "kidId": "kid_…", "completionId": "comp_…", "newBalanceCents": 12500 }
  ],
  "skipped": [
    { "kidId": "kid_…", "reason": "alreadyCompleted" }
  ]
}
```

Error: 403 if any `kidId` is outside the parent's household; 404 if task not found or inactive; 409 if every kid in the request is already credited (none would land).

### Semantics

- For each `kidId`, server creates a `TaskCompletion` row with status `approved` directly (skips `completed_pending_approval`), credits the kid's balance via the same internal helper used by `approveTask`, and writes a `BalanceEntry` with `reason: "task"` and `referenceTitle = task.title`. No new "logged by parent" reason — the entry is indistinguishable from a kid-completed-and-approved one.
- If the kid has an existing pending completion for this task today, the parent's log auto-approves that pending entry and credits the balance once, rather than creating a duplicate. The kid-initiated entry's pending row is updated to `approved` and the *Godkjenninger* queue loses one item.
- Tasks with `requiresApproval: true` still credit immediately when logged by a parent (the parent is already the approver).
- The kid's `today` query and `balance` query both invalidate via the existing notification path, so a phone-equipped kid sees the green check on next refresh.

### Recurrence

Same windowing as the existing kid-side completion:

- `daily` and `weekly` (matching today's day-of-week): one credit per kid per local calendar day.
- `once`: one credit total per kid (lifetime). Task disappears from Logg mode for that kid afterward.

### Idempotency

Two layers, both already used elsewhere in the codebase:

1. Server composite uniqueness on `(taskId, kidId, calendarDayLocal)` for `daily`/`weekly`, or `(taskId, kidId)` for `once`. Duplicate inserts return 409 with reason `alreadyCompleted` per kid.
2. Client `idempotencyKey` (UUID v4 generated per submit) so retries on flaky network do not double-credit even if the server saw the first request.

### Authorization

The handler enforces that every `kidId` belongs to the same household as the calling parent. Same scope check the existing `approveTask` handler uses.

## Mobile file changes

### Removals / moves

- `mobile/app/(parent)/(tabs)/_layout.tsx` — remove the `Tabs.Screen name="settings"` entry. Remaining order: `kids · tasks · rewards · approvals`.
- `mobile/app/(parent)/(tabs)/settings.tsx` → moved to `mobile/app/(parent)/settings.tsx`. Becomes a stack-pushed page. Imports updated for the new relative path.

### Edits

- `mobile/app/(parent)/(tabs)/kids.tsx`
  - Remove the gold "+" `addBtn` and its `handleAdd`.
  - Add a gear icon button (lucide `Settings`) top-right that routes to `/(parent)/settings`.
  - Empty-state CTA `parent.kidsList.addKid` still routes to `/(parent)/kids/new`.

- `mobile/app/(parent)/settings.tsx`
  - Add a *Husstand* section. First entry: "Legg til barn" → routes to `/(parent)/kids/new`. Second entry (placeholder, disabled with "Kommer snart" caption): "Inviter forelder".

- `mobile/app/(parent)/(tabs)/tasks.tsx`
  - Add Logg-mode state (`logMode: boolean`).
  - Add the second header button (Logg / Avslutt swap) and the headline swap.
  - Replace `TaskRow`'s `onPress` behavior conditionally: when `logMode`, open the kid picker sheet instead of routing.
  - Filter the displayed task list by today's eligibility (factor a small `isEligibleToday(task, dayOfWeek)` helper, keep it inline in this file unless reused).
  - New `KidPickerSheet` component (in-file or `mobile/components/parent/KidPickerSheet.tsx` if it grows past ~150 lines).
  - New mutation hook calling `logTaskCompletion`. On success: handle `credited` + `skipped`, fire haptics, update the inline confirmation timer.

### API client

- `mobile/lib/api.ts` — add to the parent client:

  ```ts
  async logTaskCompletion(
    taskId: string,
    body: { kidIds: string[]; idempotencyKey: string },
  ): Promise<LogTaskCompletionResponse>
  ```

- `mobile/lib/useParentApi.ts` — expose the new method via the hook.

### Shared types

- `@kroni/shared` — add `LogTaskCompletionRequest` and `LogTaskCompletionResponse` types matching the backend contract.

## Backend file changes

- New route module under the existing parent routes folder, mirroring the layout of `approveTask`. Implements the auth/household check, the per-kid loop with idempotency, and the auto-approve-pending side effect.
- New shared helper if `approveTask` and `logTaskCompletion` end up duplicating the credit-and-emit-balance-entry logic (extract once, both call it).
- DB migration only if a unique index on `(taskId, kidId, calendarDayLocal)` does not already exist for the `task_completions` table; the recurrence-windowing logic already enforces this in app code, so migration may be optional. Check the current schema before adding.

## i18n keys

Norwegian (`nb`) is authoritative; English/Swedish/Danish are translated and marked `[REVIEW]` per the project pattern.

```
parent.tasksList.logMode                  // button label / a11y
parent.tasksList.logModeHeadlineA         // "Hva er"
parent.tasksList.logModeHeadlineB         // "gjort"
parent.tasksList.logModeExit              // "Avslutt"
parent.tasksList.kidPickerEyebrow         // "Marker fullført"
parent.tasksList.kidPickerTitleA          // "Hvem gjorde"
parent.tasksList.kidPickerTitleB          // "{task}" (italic)
parent.tasksList.kidPickerNote            // "Saldoen krediteres umiddelbart — ingen godkjenning nødvendig."
parent.tasksList.kidPickerCta             // "Marker som fullført ({count})"
parent.tasksList.alreadyDone              // "Ferdig"
parent.tasksList.creditedFor              // "Ferdig for {names}"
parent.tasksList.logErrorGeneric          // "Kunne ikke logge. Prøv igjen."
parent.tasksList.logErrorAlreadyDone      // "{name} har allerede fått kreditt for denne i dag."

parent.settings.householdSection          // "Husstand"
parent.settings.addKid                    // "Legg til barn"
parent.settings.inviteParent              // "Inviter forelder"
parent.settings.inviteParentSoon          // "Kommer snart"
```

The existing `parent.kidsList.addKid` key is kept (still used by the empty state).

## Testing

- Unit: `isEligibleToday(task, today)` for `daily`, `weekly` (every day-of-week branch), `once` (active and already-done).
- Unit: client API `logTaskCompletion` request/response shape.
- Component: `KidPickerSheet` with one kid (auto-skip behavior), multiple kids (multi-select), one already-done kid (disabled + badge).
- Integration (mobile): enter Logg mode → tap task → multi-select two kids → submit → both balances reflect the credit, both rows confirm, then row disappears.
- Backend: 200 happy path; 403 cross-household; 409 all-already-done; auto-approval of an existing pending kid completion; idempotency on duplicate `idempotencyKey`.
- Manual: kid with phone — verify Today screen shows the parent-logged task as "approved" after refresh, balance reflects credit, history row reads as a normal task entry.

## Open items / risks

- **Today-eligibility filter relies on local timezone** — the kid's recurrence rules use the household's local day. Existing `getTodayTasks` already handles this; the parent-side filter must use the same helper, not naive client time. Risk: parent in a different timezone than the household. Treat household timezone as authoritative; document if helper needs to be exposed.
- **Notifications.** Parent-logged completions probably should not push a notification to the kid's device (no "your parent logged your chore" — feels off). Confirm before implementation: kid notification is suppressed for parent-logged credits.
- **Already-pending interaction** — if a kid had marked a task pending and the parent logs it on behalf, the existing approval card animation in *Godkjenninger* should handle the row disappearing on next poll (30s). Acceptable; not a sync hole.
- **Once-only tasks credited to multiple kids in one go** — the "once" recurrence is per-kid, so multi-kid select on a `once` task is fine: each kid gets their one credit and the task vanishes for them but stays for the others. Verify no global "once" semantics elsewhere.
