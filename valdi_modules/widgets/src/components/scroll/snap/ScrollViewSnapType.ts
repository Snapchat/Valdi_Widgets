export const enum ScrollViewSnapType {
  // Most commonly used, will immediately snap BEFORE the scrolling momentum has finished
  SnapAfterRelease,
  // Useful for a very subtle effect, will snap AFTER the scrolling momentum has stopped
  SnapAfterDeceleration,
}
