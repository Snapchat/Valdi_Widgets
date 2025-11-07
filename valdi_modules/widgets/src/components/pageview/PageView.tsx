import { StatefulComponent } from 'valdi_core/src/Component';
import { isDefined } from 'foundation/src/isDefined';
import { ScrollEvent } from 'valdi_tsx/src/GestureEvents';
import { CSSValue } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { DotsIndicator } from './DotsIndicator';

const DEFAULT_MAX_DOTS = 5;
const DEFAULT_DOTS_WIDTH = '40%';

export interface PageViewModel<T> {
  items: readonly T[];
  pageRenderFn: (arg: T) => void;
  // Maximum number of dot indicators displayed by the view.
  maxDots?: number;
  // The width of the dots indicator that can be represented as a number value (e.g. '100px') or a percentage (e.g. '50%').
  dotsWidth?: CSSValue;
}

export interface PageViewState {
  selectedPageIndex: number;
}

/** View that splits its results into pages presented horizontally. */
export class PageView<T> extends StatefulComponent<PageViewModel<T>, PageViewState> {
  state = { selectedPageIndex: 0 };
  contentScrollViewHandler = new ScrollViewHandler();
  dotIndicatorsScrollViewHandler = new ScrollViewHandler();
  firstVisibleDotIndex = 0;

  get pages(): readonly T[] {
    return this.viewModel.items;
  }

  get maxDots(): number {
    return this.viewModel.maxDots ?? DEFAULT_MAX_DOTS;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
  onScrollEnd = (_: ScrollEvent) => {
    const previousIndex = this.state.selectedPageIndex;

    // Calculate which page the view is at and update the page index.
    const pageSize = this.contentScrollViewHandler.getContentWidth() / this.pages.length;
    const selectedPageIndex = this.contentScrollViewHandler.scrollX / pageSize;
    this.setStateAnimated({ selectedPageIndex }, { duration: 0.2 });
    this.onPageUpdate(this.state.selectedPageIndex - previousIndex);
  };

  onPageUpdate(indexChange: number): void {
    if (
      (this.state.selectedPageIndex >= this.firstVisibleDotIndex &&
        this.state.selectedPageIndex <= this.firstVisibleDotIndex + this.maxDots - 1) ||
      !isDefined(this.dotIndicatorsScrollViewHandler.scrollViewFrame)
    ) {
      return;
    }

    // Update the dot indicator scroll view if the selected dot is not visible.
    const currentXOffset = this.dotIndicatorsScrollViewHandler.scrollX;
    const currentYOffset = this.dotIndicatorsScrollViewHandler.scrollY;
    const dotWidth = this.dotIndicatorsScrollViewHandler.scrollViewFrame.width / this.maxDots;
    this.dotIndicatorsScrollViewHandler.scrollTo(currentXOffset + dotWidth * indexChange, currentYOffset, true);
    this.firstVisibleDotIndex += indexChange;
  }

  onRender(): void {
    <scroll
      pagingEnabled={true}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      ref={this.contentScrollViewHandler}
      onScrollEnd={this.onScrollEnd}
    >
      {this.pages.map(item => {
        <layout width='100%' alignItems='center'>
          {this.viewModel.pageRenderFn(item)}
        </layout>;
      })}
    </scroll>;
    <DotsIndicator
      pageCount={this.pages.length}
      currentPageIndex={this.state.selectedPageIndex}
      maxDots={this.maxDots}
      dotsWidth={this.viewModel.dotsWidth ?? DEFAULT_DOTS_WIDTH}
      scrollViewHandler={this.dotIndicatorsScrollViewHandler}
    />;
  }
}
