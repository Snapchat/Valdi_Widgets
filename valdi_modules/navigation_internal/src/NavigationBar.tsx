import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont } from 'valdi_core/src/SystemFont';
import { when } from 'valdi_core/src/utils/When';
import { Label, View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';

export interface NavigationBarViewModel {
  title: string;
  showsBackButton: boolean;
  onBack?: () => void;
}

/**
 * Work In Progress, please don't use.
 */
export class NavigationBar extends Component<NavigationBarViewModel> {
  onRender() {
    <view style={styles.bar}>
      {when(this.viewModel?.showsBackButton, () => {
        <view paddingLeft={Spacing.MD} alignSelf='center' onTap={this.viewModel.onBack}>
          <label value='< Back' style={styles.backButton} />;
        </view>;
      })}
      <layout style={styles.separator} />
      {when(this.viewModel?.title, () => {
        <label value={this.viewModel?.title} />;
      })}
    </view>;
  }
}

const styles = {
  bar: new Style<View>({
    backgroundColor: SemanticColor.Background.SUBSCREEN,
    width: '100%',
    height: 44,
    justifyContent: 'center',
    flexDirection: 'row',
  }),
  backButton: new Style<Label>({
    color: SemanticColor.Button.PRIMARY,
    font: systemFont(13),
  }),
  separator: new Style<Layout>({
    flexGrow: 1,
  }),
};
