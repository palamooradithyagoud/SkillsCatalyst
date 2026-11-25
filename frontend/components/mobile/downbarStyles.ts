/**
 * Shared responsive sizing & spacing tokens for all mobile/tablet (< 768px)
 * floating bottom navigation docks (Dashboard, Career/Learning, Explore, Profile).
 *
 * Follows Apple HIG (44pt min touch target) and Material 3 (48dp min touch target,
 * 56px–64px navigation bar geometry) so switching routes never shifts dock height,
 * icon scale, label readability, or bottom clearance.
 */

export const DOWNBAR_NAV_CLASS =
  "fixed bottom-4 sm:bottom-5 inset-x-0 px-3 sm:px-6 flex items-center justify-center gap-2.5 sm:gap-3 pointer-events-none select-none pb-[env(safe-area-inset-bottom,0px)]";

export const DOWNBAR_CIRCLE_SIZE_CLASS =
  "w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full shrink-0 pointer-events-auto";

export const DOWNBAR_PILL_BASE_CLASS =
  "pointer-events-auto flex-1 max-w-[330px] sm:max-w-[420px] h-14 sm:h-[60px] rounded-full px-1.5 sm:px-3 flex items-center justify-around";

export const DOWNBAR_TAB_CLASS =
  "relative flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-0.5 px-1 sm:px-2 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer select-none group active:scale-95";

export const DOWNBAR_ICON_SIZE_CLASS = "w-5 h-5 sm:w-[22px] sm:h-[22px]";

export const DOWNBAR_LABEL_CLASS =
  "text-[9.5px] sm:text-[10.5px] leading-none tracking-tight whitespace-nowrap truncate max-w-full";

export const DOWNBAR_BACK_ICON_CLASS = "w-[18px] h-[18px] sm:w-5 sm:h-5";

export const DOWNBAR_BACK_LABEL_CLASS =
  "text-[9.5px] sm:text-[10.5px] font-extrabold tracking-tight mt-0.5 leading-none";
