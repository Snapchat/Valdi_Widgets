import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { DeviceHapticFeedbackType } from 'valdi_core/src/DeviceBridge';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Style } from 'valdi_core/src/Style';
import { RenderedElementUtils } from 'valdi_core/src/utils/RenderedElementUtils';
import { TouchEvent, TouchEventState } from 'valdi_tsx/src/GestureEvents';
import { Label, View, Layout, ImageView } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFontNonDynamic } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { clamp } from 'foundation/src/number';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';
import { IndexViewHandler } from './IndexViewHandler';
import { IndexViewSymbol } from './IndexViewSymbol';

const labelStyle = new Style<Label>({
  font: TextStyleFontNonDynamic.CAPTION,
  textAlign: 'center',
});
const imageStyle = new Style<ImageView>({
  height: 10,
  width: 10,
});

const styles = {
  root: new Style<Layout>({
    minWidth: 16,
    accessibilityNavigation: 'ignored',
    height: '100%',
  }),
  box: new Style<View>({
    paddingTop: Spacing.XS,
    paddingBottom: Spacing.XS,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
  }),
  labelSelected: labelStyle.extend({
    color: SemanticColor.Text.PRIMARY,
  }),
  labelDisabled: labelStyle.extend({
    color: SemanticColor.Text.TERTIARY,
  }),
  imageSelected: imageStyle.extend({
    tint: SemanticColor.Text.PRIMARY,
  }),
  imageDisabled: imageStyle.extend({
    tint: SemanticColor.Text.TERTIARY,
  }),
};

export interface IndexViewViewModel {
  symbols: IndexViewSymbol[];
  scrollViewHandler: ScrollViewHandler;
  indexViewHandler: IndexViewHandler;
  extraOffsetX?: number;
  extraOffsetY?: number;
  onTouch?: (symbol: IndexViewSymbol) => void;
}

interface IndexViewState {
  selected: number | null;
  touched: boolean;
}

/**
 * Vertical index slider, used for example for screens with multiple sections
 */
export class IndexView extends StatefulComponent<IndexViewViewModel, IndexViewState> {
  state = {
    selected: null,
    touched: false,
  };

  private root = new ElementRef();

  onRender(): void {
    const color = this.state.touched ? SemanticColor.Background.OBJECT : undefined;
    <layout style={styles.root} lazyLayout={true}>
      <view ref={this.root} style={styles.box} backgroundColor={color} onTouch={this.onTouch} touchAreaExtension={8}>
        {this.onRenderSymbols()}
      </view>
    </layout>;
  }

  private onRenderSymbols(): void {
    const selected = this.state.selected;
    const symbols = this.viewModel.symbols;
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      <layout flexBasis={1} flexGrow={1} justifyContent='center' alignItems='center'>
        {this.onRenderSymbol(symbol, i === selected)}
      </layout>;
    }
  }

  private onRenderSymbol(symbol: IndexViewSymbol, selected: boolean): void {
    if (symbol.image) {
      <image style={selected ? styles.imageSelected : styles.imageDisabled} src={symbol.image} />;
    } else {
      <label style={selected ? styles.labelSelected : styles.labelDisabled} value={symbol.label} />;
    }
  }

  private onTouch = (event: TouchEvent): void => {
    // If we removed the finger
    if (event.state === TouchEventState.Ended) {
      this.setState({
        selected: null,
        touched: false,
      });
      return;
    }
    // If we just started touching
    if (event.state === TouchEventState.Started) {
      this.setState({
        selected: null,
        touched: true,
      });
    }
    // Resolve the tapped index
    const root = this.root.single();
    if (!root) {
      return;
    }
    const viewModel = this.viewModel;
    const symbols = viewModel.symbols;
    const height = root.frame.height;
    const offset = event.y;
    const ratio = offset / height;
    const index = clamp(Math.floor(ratio * symbols.length), 0, symbols.length - 1);
    const symbol = symbols[index];
    if (index === this.state.selected) {
      return;
    }
    // If we just touched a new symbol
    Device.performHapticFeedback(DeviceHapticFeedbackType.SELECTION);
    this.setState({
      selected: index,
    });
    // If we have some logic to be triggered
    const onTouch = viewModel.onTouch;
    if (onTouch) {
      onTouch(symbol);
    }
    // Resolve the elements that are under that category
    const indexViewHandler = viewModel.indexViewHandler;
    const ref = indexViewHandler.getRef(symbol);
    if (!ref) {
      return;
    }
    const all = ref.all();
    if (all.length <= 0) {
      return;
    }
    // Resolve the scroll-relative frame of the first element of the category
    const handler = viewModel.scrollViewHandler;
    const scroll = handler.scrollView;
    const frame = handler.scrollViewFrame;
    if (scroll && frame) {
      const relativePosition = RenderedElementUtils.relativePositionTo(scroll, all[0]);
      if (relativePosition) {
        // Set a global offset to the snapping, which can be used for sticky headers for example
        const extraOffsetX = viewModel.extraOffsetX ?? 0;
        const extraOffsetY = viewModel.extraOffsetY ?? 0;
        // Limit the scroll target to the content's size
        const maxX = handler.getContentWidth() - frame.width;
        const maxY = handler.getContentHeight() - frame.height;
        // Show the proper scrolled content
        const finalX = clamp(relativePosition.x + extraOffsetX, 0, maxX);
        const finalY = clamp(relativePosition.y + extraOffsetY, 0, maxY);
        handler.scrollTo(finalX, finalY, false);
      }
    }
  };
}
