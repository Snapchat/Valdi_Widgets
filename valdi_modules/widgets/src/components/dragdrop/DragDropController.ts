import { ElementRef } from 'valdi_core/src/ElementRef';
import { Point, Vector } from 'valdi_core/src/Geometry';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { Subscribable } from 'foundation/src/Subscribable';
import { Subscription } from 'foundation/src/Subscription';
import { TouchEvent, TouchEventState } from 'valdi_tsx/src/GestureEvents';
import { View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { DragDropListener } from './DragDropListener';

const enum MotionStage {
  Start,
  Move,
  End,
}

class ElementHolder<T> extends ElementRef<T> {
  constructor(
    readonly onCreated?: (element: IRenderedElement<T>) => void,
    readonly onDestroyed?: (element: IRenderedElement<T>) => void,
  ) {
    super();
  }
  onElementCreated(element: IRenderedElement<T>): void {
    super.onElementCreated(element);
    this.onCreated?.(element);
  }
  onElementDestroyed(element: IRenderedElement<T>): void {
    super.onElementDestroyed(element);
    this.onDestroyed?.(element);
  }
}

/**
 * Centralize and hold all elements required to create a drag&drop interaction
 * Allow listeners to register to user drag&drop events
 */
export class DragDropController {
  /**
   * Hold all drag&drop events listeners
   */
  private listeners = new Subscribable<DragDropListener>();

  /**
   * Hold all elements that we will be interacting with
   */
  private containers: ElementHolder<View>;
  private objects: ElementHolder<View>;
  private zones: ElementHolder<Layout>;

  /**
   * Hold all motion stats
   */
  private currentDragging = false;
  private currentTouched = false;
  private currentPressed = false;

  private currentCollisions = new Set<number>();
  private currentObject?: IRenderedElement;
  private currentContainer?: IRenderedElement;

  private currentEventOrigin?: Point;
  private currentEventDelta?: Vector;

  /**
   * Prep
   */
  constructor() {
    this.containers = new ElementHolder<View>(this.containerCreate);
    this.objects = new ElementHolder<View>(this.objectCreate);
    this.zones = new ElementHolder<Layout>();
  }

  /**
   * Public API
   */
  get containersRef(): ElementRef<View> {
    return this.containers;
  }
  get objectsRef(): ElementRef<View> {
    return this.objects;
  }
  get zonesRef(): ElementRef<Layout> {
    return this.zones;
  }

  /**
   * Listeners
   */
  subscribeListener(listener: DragDropListener): Subscription {
    return this.listeners.subscribe(listener);
  }

  /**
   * Motion starting, check if all events are good to go
   */
  private motionCheckStart(): void {
    // Check if we can be starting the drag
    if (!this.currentPressed || !this.currentTouched) {
      return;
    }
    if (this.currentDragging) {
      return;
    }
    this.currentDragging = true;
    // Notify all listeners
    this.motionNotify(MotionStage.Start);
  }
  /**
   * Motion moves, if we are dragging, check collisions
   */
  private motionCheckMove(): void {
    // Check if we are currently dragging
    if (!this.currentDragging) {
      return;
    }
    // Notify all listeners
    this.motionNotify(MotionStage.Move);
  }
  /**
   * Motion stopping, if touch events have stopped hapening, wrap up all
   */
  private motionCheckStop(): void {
    // Check if we are about to stop
    if (this.currentPressed && this.currentTouched) {
      return;
    }
    if (!this.currentDragging) {
      return;
    }
    this.currentDragging = false;
    // Notify all listeners
    this.motionNotify(MotionStage.End);
    // Wrap up
    this.currentDragging = false;
    this.currentTouched = false;
    this.currentPressed = false;
    this.currentContainer = undefined;
    this.currentObject = undefined;
    this.currentCollisions = new Set<number>();
    this.currentEventOrigin = undefined;
    this.currentEventDelta = undefined;
  }

  /**
   * Forcefully stop the current drag
   */
  private motionDoReset(): void {
    // Force pretend user stopped dragging
    this.currentTouched = false;
    this.currentPressed = false;
    // Do the actual motion stop
    this.motionCheckStop();
  }

  /**
   * Update the current motion states and notify all dragdrop listeners of any changes
   */
  private motionNotify(stage: MotionStage): void {
    // Check we have all dependencies
    if (!this.currentObject) {
      return;
    }
    if (!this.currentContainer) {
      return;
    }
    if (!this.currentEventDelta) {
      return;
    }

    // Subscribers
    const subscribers = this.listeners.subscribers();

    // Find the relative dragged object position
    const elementObject = this.currentObject;
    const elementContainer = this.currentContainer;
    const relativePositionObject = RenderedElementUtils.relativePositionTo(elementContainer, elementObject);
    if (!relativePositionObject) {
      return;
    }
    const frameObject = elementObject.frame;
    relativePositionObject.x += this.currentEventDelta.dx + frameObject.width / 2;
    relativePositionObject.y += this.currentEventDelta.dy + frameObject.height / 2;

    // Loop and find all possible collision zones
    const collidingZones = [];
    for (const zone of this.zones.all()) {
      // Lookups
      const elementZone = zone;
      const zoneId = elementZone.id;
      const collisionBefore = this.currentCollisions.has(zoneId);

      let collisionPosition = undefined;
      let collisionNow = false;

      // Check collisions, we'll resolve relative positioning and compare with zone's frame
      const relativePositionZone = RenderedElementUtils.relativePositionTo(elementContainer, elementZone);
      if (relativePositionZone) {
        collisionPosition = {
          x: relativePositionObject.x - relativePositionZone.x,
          y: relativePositionObject.y - relativePositionZone.y,
        };
        collisionNow = RenderedElementUtils.frameContainsPosition(elementZone.frame, collisionPosition);
        if (collisionNow) {
          collidingZones.push(elementZone);
        }
      }

      // If we are colliding with this zone
      if (collisionNow && collisionPosition && stage !== MotionStage.End) {
        // Start a new hover if we're colliding for the first time
        if (!collisionBefore) {
          for (const subscriber of subscribers) {
            subscriber.onZoneHoverStart?.(elementObject, elementZone, collisionPosition);
          }
          this.currentCollisions.add(zoneId);
        }
        // If we were already colliding, move collision
        else {
          for (const subscriber of subscribers) {
            subscriber.onZoneHoverMove?.(elementObject, elementZone, collisionPosition);
          }
        }
      }
      // If we are not colliding with this zone
      else {
        // Stop hover if we were colliding before
        if (collisionBefore) {
          for (const subscriber of subscribers) {
            subscriber.onZoneHoverEnd?.(elementObject, elementZone);
          }
          this.currentCollisions.delete(zoneId);
        }
      }
    }

    // Notify subscribers of dragging state
    switch (stage) {
      case MotionStage.Start:
        for (const subscriber of subscribers) {
          subscriber.onDragDropStart?.(elementObject, collidingZones, elementContainer);
          subscriber.onContainerHoverStart?.(elementObject, elementContainer, relativePositionObject);
        }
        break;
      case MotionStage.Move:
        for (const subscriber of subscribers) {
          subscriber.onDragDropMove?.(elementObject, collidingZones, elementContainer);
          subscriber.onContainerHoverMove?.(elementObject, elementContainer, relativePositionObject);
        }
        break;
      case MotionStage.End:
        for (const subscriber of subscribers) {
          subscriber.onDragDropEnd?.(elementObject, collidingZones, elementContainer);
          subscriber.onContainerHoverEnd?.(elementObject, elementContainer);
        }
        break;
    }
  }

  /**
   * Object
   */
  private objectCreate = (object: IRenderedElement): void => {
    object.setAttribute('onLongPress', () => {
      this.objectLongPress(object);
    });
  };
  private objectLongPress = (object: IRenderedElement): void => {
    if (this.currentObject && this.currentObject !== object) {
      this.motionDoReset();
    }
    this.currentObject = object;
    this.currentPressed = true;
    this.motionCheckStart();
    this.motionCheckMove();
  };

  /**
   * Container
   */
  private containerCreate = (container: IRenderedElement): void => {
    container.setAttribute('onTouch', (event: TouchEvent) => {
      this.containerTouch(container, event);
    });
  };
  private containerTouch = (container: IRenderedElement, event: TouchEvent): void => {
    if (this.currentContainer && this.currentContainer !== container) {
      this.motionDoReset();
    }
    this.currentContainer = container;
    switch (event.state) {
      case TouchEventState.Started:
        this.currentTouched = true;
        this.currentEventOrigin = {
          x: event.absoluteX,
          y: event.absoluteY,
        };
        this.currentEventDelta = {
          dx: 0,
          dy: 0,
        };
        break;
      case TouchEventState.Changed:
        break;
      case TouchEventState.Ended:
        this.currentTouched = false;
        break;
    }
    const origin = this.currentEventOrigin;
    const delta = this.currentEventDelta;
    if (origin && delta) {
      delta.dx = event.absoluteX - origin.x;
      delta.dy = event.absoluteY - origin.y;
    }
    this.motionCheckStart();
    this.motionCheckMove();
    this.motionCheckStop();
  };
}
