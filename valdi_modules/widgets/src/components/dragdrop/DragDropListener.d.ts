import { Point } from 'valdi_core/src/Geometry';
import { IRenderedElement } from 'valdi_core/src/IRenderedElement';

export interface DragDropListener {
  onZoneHoverStart?(object: IRenderedElement, zone: IRenderedElement, positionInZone: Point): void;
  onZoneHoverMove?(object: IRenderedElement, zone: IRenderedElement, positionInZone: Point): void;
  onZoneHoverEnd?(object: IRenderedElement, zone: IRenderedElement): void;

  onContainerHoverStart?(object: IRenderedElement, container: IRenderedElement, positionInContainer: Point): void;
  onContainerHoverMove?(object: IRenderedElement, container: IRenderedElement, positionInContainer: Point): void;
  onContainerHoverEnd?(object: IRenderedElement, container: IRenderedElement): void;

  onDragDropStart?(object: IRenderedElement, zones: readonly IRenderedElement[], container: IRenderedElement): void;
  onDragDropMove?(object: IRenderedElement, zones: readonly IRenderedElement[], container: IRenderedElement): void;
  onDragDropEnd?(object: IRenderedElement, zones: readonly IRenderedElement[], container: IRenderedElement): void;
}
