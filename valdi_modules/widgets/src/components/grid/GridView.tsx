import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { Style } from 'valdi_core/src/Style';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { SpinnerView, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { calcContentArea, splitInChunks, toPctStr } from './utils';

const ITEMS_PER_ROW = 3;

interface GridViewModel<T> {
  items: readonly T[];
  gridWidth: number;
  deviceDisplayBottomInset: number;
  itemsPerRow?: number;
  onRenderHeader?: () => void;
  onRenderFooter?: () => void;
  // Whether to disable lazy layout for each grid item.
  // Setting this will set `aspectRatio` to be undefined to enforce consumers
  // to be responsible for setting the desired height for each grid item.
  disableLazyLayout?: boolean;
  // Allows customization of the width/height ratio for the grid item.
  overrideAspectRatio?: number;
  // Allows customization of the grid row's layout style.
  overrideGridRowStyle?: Style<Layout>;
  // Allows customization of the width of the grid item.
  overrideGridItemWidth?: number;
}

interface GridViewState {
  contentArea: number;
}

interface GridViewContext<T> {
  onGridViewCreated?: () => void;
  onLayoutGridRow?: (frame: ElementFrame, rowIndex: number) => void;
  renderItem(item: T, borderRadius: number, index: number): void;
}

export class GridView<T> extends StatefulComponent<GridViewModel<T>, GridViewState, GridViewContext<T>> {
  defaultGridRowStyle = new Style<Layout>({
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  });

  state: GridViewState = {
    contentArea: calcContentArea(),
  };

  updateLayoutParams = (): void => {
    this.setState({ contentArea: calcContentArea() });
  };

  override onCreate(): void {
    const observer = Device.observeDisplayInsetChange(this.updateLayoutParams);
    this.registerDisposable(observer.cancel);
  }

  override onRender(): void {
    const itemsPerRow = this.viewModel.itemsPerRow ?? ITEMS_PER_ROW;
    const spaceWidthPct = 0.026;
    const itemWidthPctStr = toPctStr((1 - (itemsPerRow + 1) * spaceWidthPct) / itemsPerRow);
    const itemAspectRatio = this.viewModel.overrideAspectRatio ?? 112 / 162;
    const itemBorderRadius = 13;

    <scroll
      width={'100%'}
      height={'100%'}
      paddingTop={this.viewModel.gridWidth * spaceWidthPct}
      paddingLeft={1}
      paddingRight={1}
      showsVerticalScrollIndicator={false}
      onViewCreate={this.context.onGridViewCreated}
    >
      {this.viewModel.onRenderHeader?.()}
      {splitInChunks(this.viewModel.items, itemsPerRow).forEach((chunk, chunkIndex) => {
        <layout
          style={this.viewModel.overrideGridRowStyle ?? this.defaultGridRowStyle}
          marginBottom={this.viewModel.gridWidth * spaceWidthPct}
          // eslint-disable-next-line valdi/jsx-no-lambda
          onLayout={frame => this.context.onLayoutGridRow?.(frame, chunkIndex)}
        >
          {chunk.forEach((item, itemIndex) => {
            const index = itemsPerRow * chunkIndex + itemIndex;

            <view
              width={this.viewModel.overrideGridItemWidth ?? itemWidthPctStr}
              aspectRatio={this.viewModel.disableLazyLayout ? undefined : itemAspectRatio}
              borderRadius={itemBorderRadius}
              lazyLayout={!this.viewModel.disableLazyLayout}
            >
              {this.context.renderItem(item, itemBorderRadius, index)}
            </view>;
          })}
        </layout>;
      })}
      {this.viewModel.onRenderFooter?.()}
      <layout height={this.state.contentArea * 0.15 + this.viewModel.deviceDisplayBottomInset} />
    </scroll>;
  }
}

/**
 * A wrapper for [GridView] to display a spinner when items are empty.
 */
export class GridViewWrapper<T> extends Component<GridViewModel<T>, GridViewContext<T>> {
  spinnerStyle = new Style<SpinnerView>({
    backgroundColor: 'lightblue',
    width: 38,
    height: 38,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 50,
    color: SemanticColor.Icon.PRIMARY,
  });

  override onRender(): void {
    if (this.viewModel.items.length) {
      <GridView
        items={this.viewModel.items}
        onRenderHeader={this.viewModel.onRenderHeader}
        onRenderFooter={this.viewModel.onRenderFooter}
        gridWidth={this.viewModel.gridWidth}
        deviceDisplayBottomInset={this.viewModel.deviceDisplayBottomInset}
        context={this.context}
      />;
    } else {
      <layout width={'100%'} height={'100%'}>
        <spinner style={this.spinnerStyle} />
      </layout>;
    }
  }
}
