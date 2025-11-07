import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label, View } from 'valdi_tsx/src/NativeTemplateElements';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { systemFont } from 'valdi_core/src/SystemFont';

const styles = {
  container: new Style<View>({
    width: '100%',
    padding: 8,
  }),
  text: new Style<Label>({
    font: systemFont(12),
  }),
};

interface SectionStatusBarViewModel {
  statusColor: StatusColor;
  text: string;
  accessibilityId?: string;
}

export enum StatusColor {
  Blue,
  Red,
  Green,
  Purple,
}

export class SectionStatusBar extends StatefulComponent<SectionStatusBarViewModel, {}> {
  onRender(): void {
    <view
      style={styles.container}
      backgroundColor={this.getContainerColor()}
      accessibilityId={this.viewModel.accessibilityId}
    >
      <label
        style={styles.text}
        color={this.getTextColor()}
        textAlign={'center'}
        value={this.viewModel.text}
        numberOfLines={0}
      />
    </view>;
  }

  private getContainerColor(): string | undefined {
    switch (this.viewModel.statusColor) {
      case StatusColor.Blue:
        return 'rgba(15,173,255,0.15)'; // SemanticColor.Icon.SELECTED
      case StatusColor.Red:
        return 'rgba(242,60,87,0.15)'; // SemanticColor.Icon.ERROR
      case StatusColor.Green:
        return 'rgba(41,207,147,0.15)'; // SemanticColor.Icon.SUCCESS
      case StatusColor.Purple:
        return 'rgba(216, 61, 241, 0.05)';
    }
  }
  private getTextColor(): string | undefined {
    switch (this.viewModel.statusColor) {
      case StatusColor.Blue:
        return SemanticColor.Icon.SELECTED;
      case StatusColor.Red:
        return SemanticColor.Icon.ERROR;
      case StatusColor.Green:
        return SemanticColor.Icon.SUCCESS;
      case StatusColor.Purple:
        return '#CD3DF1';
    }
  }
}
