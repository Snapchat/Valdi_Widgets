import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { DeviceHapticFeedbackType } from 'valdi_core/src/DeviceBridge';
import { Style } from 'valdi_core/src/Style';
import { Label, View, Layout, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';
import { ScrollViewSnapAlign } from 'widgets/src/components/scroll/snap/ScrollViewSnapAlign';
import { ScrollViewSnapAnchor } from 'widgets/src/components/scroll/snap/ScrollViewSnapAnchor';
import { ScrollViewSnapController } from 'widgets/src/components/scroll/snap/ScrollViewSnapController';
import { ScrollViewSnapType } from 'widgets/src/components/scroll/snap/ScrollViewSnapType';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { systemFont } from 'valdi_core/src/SystemFont';

export interface PickerViewModel {
  /** Index of initially selected item, which defaults to zero if unset */
  readonly index?: number;
  /** Labels to show for each item. */
  readonly labels: string[];
  /** Callback for when a new item is selected. */
  readonly onChange: (index: number) => void;
  readonly height: number;
}

export interface PickerViewState {
  readonly selectedIndex?: number;
  readonly highlightedIndex?: number;
}

const CELL_HEIGHT = 18 + 8 * 2;

/**
 * An indexed Picker which doesn't use any native views and looks the same on all
 * platforms. It takes in an array of labels and a start index, and calls back whenever
 * a new value is selected.
 */
export class PickerView extends StatefulComponent<PickerViewModel, PickerViewState> {
  override state: PickerViewState = {
    selectedIndex: this.viewModel.index,
  };

  private readonly scrollViewHandler = new ScrollViewHandler();
  private readonly scrollViewSnapController = new ScrollViewSnapController(this.scrollViewHandler, {
    type: ScrollViewSnapType.SnapAfterRelease,
    align: ScrollViewSnapAlign.CenterToCenter,
    flingMaxDistanceY: CELL_HEIGHT / 2,
  });

  private readonly scrollViewSnapSubscription = this.scrollViewSnapController.startSnapping({
    onAnchorSnap: index => this.onItemSelected(index),
    onAnchorScroll: index => this.onItemHighlight(index),
  });

  private initialLayout = true;

  override onRender(): void {
    const padding = (this.viewModel.height - CELL_HEIGHT) / 2;
    <layout
      height={this.viewModel.height}
      style={style.container}
      // eslint-disable-next-line valdi/jsx-no-lambda
      onLayoutComplete={() => {
        if (this.initialLayout) {
          this.scrollViewSnapController.doSnapNowToIndex(this.state.selectedIndex ?? 0);
          this.initialLayout = false;
        }
      }}
    >
      <scroll fadingEdgeLength={this.viewModel.height / 3} ref={this.scrollViewHandler} style={style.scrollView}>
        <view height={padding} />
        <view style={style.scrollInnerContainer}>
          {this.viewModel.labels.forEach((label, index) => {
            const labelStyle =
              index === this.state.highlightedIndex ? Style.merge(style.label, style.highlightedLabel) : style.label;
            <layout style={style.item} key={label}>
              <ScrollViewSnapAnchor controller={this.scrollViewSnapController}>
                <view
                  style={style.view}
                  // eslint-disable-next-line valdi/jsx-no-lambda
                  onTap={() => this.onTap(index)}
                >
                  <label value={label} style={labelStyle} />
                </view>
              </ScrollViewSnapAnchor>
            </layout>;
          })}
          <view height={padding} />
        </view>
      </scroll>
      <view style={style.selectionBox} />
    </layout>;
  }

  override onCreate(): void {
    this.scrollViewSnapController.doSnapNowToIndex(this.state.selectedIndex ?? 0, false);
  }

  override onDestroy(): void {
    this.scrollViewSnapSubscription.unsubscribe();
  }

  private onItemSelected(index: number): void {
    if (this.state.selectedIndex === index) return;
    this.viewModel.onChange(index);
    this.setState({
      selectedIndex: index,
    });
  }

  private onItemHighlight(index: number): void {
    if (this.state.highlightedIndex === index) return;
    if (this.state.highlightedIndex !== undefined) {
      Device.performHapticFeedback(DeviceHapticFeedbackType.SELECTION);
    }
    this.setState({
      highlightedIndex: index,
    });
  }

  private onTap(index: number): void {
    this.scrollViewSnapController.doSnapNowToIndex(index, true);
  }
}

const style = {
  scrollView: new Style<ScrollView>({
    width: '100%',
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
  }),
  scrollInnerContainer: new Style<Layout>({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  }),
  container: new Style<Layout>({
    width: '100%',
  }),
  item: new Style<Layout>({
    width: '100%',
    margin: 0,
    paddingLeft: Spacing.SM,
    paddingRight: Spacing.SM,
  }),
  label: new Style<Label>({
    font: systemFont(18),
    color: SemanticColor.Text.SECONDARY,
  }),
  highlightedLabel: new Style<Label>({
    color: SemanticColor.Text.PRIMARY,
  }),
  view: new Style<View>({
    padding: Spacing.SM,
    width: '100%',
    alignItems: 'center',
  }),
  selectionBox: new Style<View>({
    position: 'absolute',
    width: '100%',
    height: '14%',
    top: '43%',
    zIndex: -1, // allows dragging over the view
    background: SemanticColor.Background.OBJECT,
    borderColor: SemanticColor.Background.MAIN,
    borderRadius: 12,
  }),
};
