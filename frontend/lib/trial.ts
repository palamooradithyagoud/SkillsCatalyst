// frontend/lib/trial.ts

export const TRIAL_CONFIG = {
  name: "7-Day Free Trial",
  totalDays: 7,
  badgeText: "7-Day Free Trial",
  subtitle: "Start your 7-day free trial on 1-Month or 3-Month plans.",
};

/**
 * Checks if current user has active Pro access (either via active trial or stored pro status).
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
