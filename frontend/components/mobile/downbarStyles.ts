/**
 * Shared responsive sizing & spacing tokens for all mobile/tablet (< 768px)
 * floating bottom navigation docks (Dashboard, Career/Learning, Explore, Profile).
 *
 * Tuned to a compact 48px mobile / 54px tablet capsule profile (meeting 48dp / 44pt
 * touch targets) with 17px/19px icons and crisp single-line labels so 4-item and
 * 5-item docks never crowd or truncate on narrow phones (360px+).
 */

export const DOWNBAR_NAV_CLASS =
  "fixed bottom-3.5 sm:bottom-5 inset-x-0 px-2.5 sm:px-6 flex items-center justify-center gap-2 sm:gap-3 pointer-events-none select-none pb-[env(safe-area-inset-bottom,0px)]";

export const DOWNBAR_CIRCLE_SIZE_CLASS =
  "w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-full shrink-0 pointer-events-auto";

export const DOWNBAR_PILL_BASE_CLASS =
  "pointer-events-auto flex-1 max-w-[340px] sm:max-w-[430px] h-12 sm:h-[54px] rounded-full px-1.5 sm:px-2.5 flex items-center justify-around";

export const DOWNBAR_TAB_CLASS =
  "relative flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-0.5 px-0.5 sm:px-1.5 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer select-none group active:scale-95";

export const DOWNBAR_ICON_SIZE_CLASS = "w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]";

export const DOWNBAR_LABEL_CLASS =
  "text-[8.5px] sm:text-[10px] leading-none tracking-[-0.02em] whitespace-nowrap max-w-full";

export const DOWNBAR_BACK_ICON_CLASS = "w-4 h-4 sm:w-[18px] sm:h-[18px]";

export const DOWNBAR_BACK_LABEL_CLASS =
  "text-[8.5px] sm:text-[9.5px] font-extrabold tracking-tight mt-0.5 leading-none";
