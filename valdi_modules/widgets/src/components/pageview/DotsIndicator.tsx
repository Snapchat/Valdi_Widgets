import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { CSSValue, Layout, View } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { SemanticColor } from 'widgets/src/styles/semanticColorsGen';

const carouselDotSize = 6.5;

const style = {
  dotsContainer: new Style<Layout>({
    padding: 8,
    alignItems: 'center',
  }),

  carouselDot: new Style<View>({
    height: carouselDotSize,
    width: carouselDotSize,
    borderRadius: '100%',
  }),
};

interface DotsIndicatorViewModel {
  pageCount: number;
  currentPageIndex: number;
  maxDots: number;
  dotsWidth: CSSValue;
  scrollViewHandler: ScrollViewHandler;
}

/** Dots indicating the number of pages and currently selected page of a page view. */
export class DotsIndicator extends Component<DotsIndicatorViewModel> {
  get pageCount(): number {
    return this.viewModel.pageCount;
  }

  onRender(): void {
    {
      when(this.pageCount > 0, () => {
        <layout style={style.dotsContainer}>
          <scroll
            width={this.viewModel.dotsWidth}
            horizontal={true}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            justifyContent={this.pageCount > this.viewModel.maxDots ? 'flex-start' : 'center'}
            ref={this.viewModel.scrollViewHandler}
          >
            {this.renderDots()}
          </scroll>
        </layout>;
      });
    }
  }

  renderDots(): void {
    for (let index = 0; index < this.pageCount; index++) {
      const selected = index === this.viewModel.currentPageIndex;
      <layout width={`${100 / this.viewModel.maxDots}%`} alignItems={'center'}>
        {
          // Carousel Dot
          <view
            style={style.carouselDot}
            backgroundColor={selected ? SemanticColor.Icon.PRIMARY : SemanticColor.Icon.TERTIARY}
          />
        }
      </layout>;
    }
  }
}
