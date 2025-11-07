import { Component } from 'valdi_core/src/Component';
import { RenderFunction } from '../RenderFunction';
import { MeasuredComponentSize } from './MeasureCache';

interface ViewModel {
  /**
   * Whether the measured size should always be in non decimal points value.
   * When set, the measured size will be rounded up to the next point, for
   * example 34.253 would be returned as 35. Use this option if you are rendering
   * a list of cells and want the layout to be more deterministic.
   */
  roundToPoints?: boolean;
  onMeasured: (size: MeasuredComponentSize) => void;
  children?: RenderFunction;
}

/**
 * Component measurer is a helper tool to render any component through
 * a slot, and capture the measured width/height of that component.
 * Callers should make sure the component being rendered is invisible
 * during measurement. The main intended use case is to allow resolving
 * the size of a cell within a large scrollable list, and then use that
 * size to render each item with a <Lazy> component with a forced width/height.
 */
export class ComponentMeasurer extends Component<ViewModel, {}> {
  private lastFrameWidth?: number;
  private lastFrameHeight?: number;

  onRender(): void {
    this.viewModel.children?.();

    this.renderer.onLayoutComplete(() => {
      this.onLayoutCompleted();
    });
  }

  private onLayoutCompleted(): void {
    if (this.isDestroyed()) {
      return;
    }

    let width = 0;
    let height = 0;
    for (const element of this.renderer.getComponentRootElements(this, true)) {
      width += element.frame.width;
      height += element.frame.height;
    }

    if (this.viewModel.roundToPoints) {
      width = Math.ceil(width);
      height = Math.ceil(height);
    }

    if (width !== this.lastFrameWidth || height !== this.lastFrameHeight) {
      this.lastFrameWidth = width;
      this.lastFrameHeight = height;
      this.viewModel.onMeasured({ width, height });
    }
  }
}
