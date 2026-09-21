/**
 * frontend/lib/trial.ts
 * 
 * @deprecated
 * LEGACY CLIENT-SIDE TRIAL & PRO MOCK SYSTEM.
 * 
 * WARNING & SECURITY INVARIANT:
 * The localStorage keys `skillscatalyst_pro_member`, `skillscatalyst_pro_plan`,
 * and `skillscatalyst_trial_end` are legacy frontend-only mock state used during
 * early prototyping.
 * 
 * The FastAPI backend DOES NOT trust or read these localStorage keys. Authoritative
 * subscription status and 7-feature entitlements are strictly managed by
 * `public.user_subscriptions` and `public.plan_entitlements` via `/api/subscriptions/me`
 * and the `useSubscription` hook.
 * 
 * In Phase 3, components will transition to `useSubscription()` for all entitlement checks.
 */

export const TRIAL_CONFIG = {
  name: "7-Day Free Trial",
  totalDays: 7,
  badgeText: "7-Day Free Trial",
  subtitle: "Start your 7-day free trial on 1-Month or 3-Month plans.",
};

/**
 * @deprecated Use useSubscription().isPremium for verified server subscription status.
 * Checks if current user has active Pro access in legacy local storage.
 */
export function hasProAccess(): boolean {
  if (typeof window !== "undefined") {
    const isPro = localStorage.getItem("skillscatalyst_pro_member") === "true";
    const trialEnd = localStorage.getItem("skillscatalyst_trial_end");
    if (trialEnd) {
      const endMs = parseInt(trialEnd, 10);
      if (!isNaN(endMs) && Date.now() <= endMs) {
        return true;
      }
    }
    return isPro;
  }
  return false;
}

/**
 * Activates the 7-day free trial for the user in local storage.
 */
export function activateUserTrial(planId: "1month" | "3months" = "1month"): void {
  if (typeof window === "undefined") return;
  const trialEndMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
  localStorage.setItem("skillscatalyst_pro_member", "true");
  localStorage.setItem("skillscatalyst_pro_plan", planId);
  localStorage.setItem("skillscatalyst_trial_end", String(trialEndMs));
  window.dispatchEvent(new Event("skillscatalyst_pro_updated"));
}

/**
 * Checks if user has explicitly claimed/activated the trial and it is still valid.
 */
export function isUserTrialClaimed(): boolean {
  if (typeof window === "undefined") return false;
  const trialEnd = localStorage.getItem("skillscatalyst_trial_end");
  if (!trialEnd) return false;
  const endMs = parseInt(trialEnd, 10);
  return !isNaN(endMs) && Date.now() <= endMs;
}

/**
 * Calculates how many days are left in the user's trial.
 */
export function getTrialDaysRemaining(): number {
  if (typeof window === "undefined") return 7;
  const trialEnd = localStorage.getItem("skillscatalyst_trial_end");
  if (!trialEnd) return 7;
  const endMs = parseInt(trialEnd, 10);
  if (isNaN(endMs)) return 7;
  const diffMs = endMs - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Backwards compatibility helper
 */
export function isGlobalTrialActive(): boolean {
  return isUserTrialClaimed();
}
