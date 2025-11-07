import { ScrollEvent, ScrollDragEndEvent } from 'valdi_tsx/src/GestureEvents';
import { ScrollViewListener } from '../scroll/ScrollViewListener';

export class DragToDismissController implements ScrollViewListener {
  // The current drag session is eligible to trigger a dismiss on end
  public isEligibleForDismiss = true;

  public onCouldDismiss?: (couldDismiss: boolean) => void;
  public onShouldDismiss?: (evt: ScrollDragEndEvent) => void;

  // How much a the scroll content must travel downwards *from the top* to trigger a dismiss
  private distanceDismissThreshold: number;
  // How much a drag is allowed to travel down *from the top* to prevent the current drag from ever dismissing
  private distanceDismissSlop: number;
  // How much velocity is needed to dismiss, without accounting for distance
  private velocityDismissThreshold: number;
  // Must be at least this far from the top for a dismiss to happen
  private minVelocityDismissDistance: number;

  // The current drag session should trigger a dismiss on end
  private shouldDismissOnScrollRelease = false;
  // The current drag session was ever eligible to trigger a dismiss on end
  private wasEligibleForDismiss = false;

  // Drag is active
  private isDragging = false;

  constructor({
    distanceDismissThreshold = 30,
    distanceDismissSlop = 10,
    velocityDismissThresHold = -0.6,
    minVelocityDismissDistance = 5,
  } = {}) {
    this.distanceDismissThreshold = distanceDismissThreshold;
    this.distanceDismissSlop = distanceDismissSlop;
    this.velocityDismissThreshold = velocityDismissThresHold;
    this.minVelocityDismissDistance = minVelocityDismissDistance;
  }

  onDragStart(): void {
    this.isDragging = true;
    this.isEligibleForDismiss = true;
    this.wasEligibleForDismiss = false;
  }

  onScroll(evt: ScrollEvent): void {
    if (evt.y > this.distanceDismissSlop && !this.wasEligibleForDismiss) {
      // If the current drag never passed the threshold for dismissal, scrolling up > `distanceDismissSlop`pt
      // before dismissal threshold is hit renders this scroll session ineligible for a scroll-to-dismiss.
      // This prevents accidental swipes from triggering a dismiss.
      this.isEligibleForDismiss = false;
    }

    // Prevent flicks from triggering an accidental dismissal
    if (this.isDragging && this.isEligibleForDismiss) {
      if (-evt.y > this.distanceDismissThreshold && !this.shouldDismissOnScrollRelease) {
        this.shouldDismissOnScrollRelease = true;
        this.wasEligibleForDismiss = true;
        if (this.onCouldDismiss) {
          this.onCouldDismiss(true);
        }
      } else if (-evt.y < this.distanceDismissThreshold && this.shouldDismissOnScrollRelease) {
        this.shouldDismissOnScrollRelease = false;
        if (this.onCouldDismiss) {
          this.onCouldDismiss(false);
        }
      }
    }
  }

  onDragEnd(evt: ScrollDragEndEvent): void {
    if (evt.velocityY > 0) return;

    if (
      evt.velocityY < this.velocityDismissThreshold &&
      evt.y <= -this.minVelocityDismissDistance &&
      this.isEligibleForDismiss &&
      !this.shouldDismissOnScrollRelease
    ) {
      // Last recorded velocity is fast enough to warrant a dismissal,
      // assuming it is still eligible.
      this.shouldDismissOnScrollRelease = true;
    }

    this.isDragging = false;
    this.wasEligibleForDismiss = false;

    if (!this.shouldDismissOnScrollRelease) return undefined;
    this.shouldDismissOnScrollRelease = false;

    if (this.onShouldDismiss) {
      this.onShouldDismiss(evt);
    }
    return;
  }
}
