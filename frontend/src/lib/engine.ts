import type { Plan } from "../types/intent";
import { executeAction, type Undo } from "./actions";

/**
 * The engine is the single source of truth for "what is currently applied".
 * It maintains a flat stack of undo closures (one per action) so:
 *   - reset() pops everything in reverse order, restoring the original page.
 *   - undoLast() peels off the most recent batch (one full plan).
 *
 * Design choice: each applyPlan() is recorded as a "batch" on the stack
 * so undoLast() removes one user voice-input's worth of changes at a time.
 */

interface Batch {
  reason: string;
  undos: Undo[];
}

const stack: Batch[] = [];

function ensureActiveClass() {
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("an-active");
  }
}

function maybeRemoveActiveClass() {
  if (typeof document !== "undefined" && stack.length === 0) {
    document.documentElement.classList.remove("an-active");
  }
}

export function applyPlan(plan: Plan): void {
  ensureActiveClass();
  const undos: Undo[] = [];
  for (const action of plan.actions) {
    try {
      undos.push(executeAction(action));
    } catch (err) {
      console.error("[engine] action failed:", action, err);
    }
  }
  stack.push({ reason: plan.reason_short, undos });
}

export function undoLast(): boolean {
  const batch = stack.pop();
  if (!batch) return false;
  // Undo in reverse order to mirror application order.
  for (let i = batch.undos.length - 1; i >= 0; i--) batch.undos[i]();
  maybeRemoveActiveClass();
  return true;
}

export function reset(): void {
  while (stack.length > 0) undoLast();
}

export function appliedBatchCount(): number {
  return stack.length;
}

/**
 * Test helper / dev-only: clears state without running undos.
 * Do NOT call in production paths — leaves DOM in a mutated state.
 */
export function __resetStateForTests(): void {
  stack.length = 0;
}
