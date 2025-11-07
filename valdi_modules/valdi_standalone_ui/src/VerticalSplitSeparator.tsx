import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import res from 'valdi_standalone_ui/res';
import { ViewAttributes, View, ImageView } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';

export interface VerticalSplitSeparatorViewModel {
  resizable?: boolean;
  onDragSeparator?: ViewAttributes['onDrag'];
}

const SEPARATOR_WIDTH = 2;

const styles = {
  separator: new Style<View>({
    height: '100%',
    width: SEPARATOR_WIDTH,
    backgroundColor: SemanticColor.Layout.DIVIDER,
    marginLeft: Spacing.MD,
    marginRight: Spacing.MD,
    flexShrink: 0,
  }),

  separatorContainer: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    width: `${Spacing.MD + SEPARATOR_WIDTH + Spacing.MD}px`,
  }),

  resizeIcon: new Style<ImageView>({
    position: 'absolute',
    left: 9,
    top: -2,
    zIndex: 1,
  }),
};

export class VerticalSplitSeparator extends Component<VerticalSplitSeparatorViewModel> {
  onRender() {
    const { onDragSeparator, resizable } = this.viewModel;
    if (!resizable) {
      <view style={styles.separator} />;
    } else {
      <view style={styles.separatorContainer} onDrag={onDragSeparator}>
        <image src={res.resizeIcon} style={styles.resizeIcon} />
        <view style={styles.separator} />
      </view>;
    }
  }
}
