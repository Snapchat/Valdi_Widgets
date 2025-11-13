import { StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { DeviceHapticFeedbackType } from 'valdi_core/src/DeviceBridge';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { Label, View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { PickerView } from './PickerView';

/**
 * @ViewModel
 * @ExportModel({
 *  ios: 'SCCPickerActionSheetViewModel',
 *  android: 'com.snap.valdi.widgets.PickerActionSheetViewModel'
 * })
 */
export interface PickerActionSheetViewModel {
  /** Sheet title */
  readonly title: string;
  /** Index of initially selected item, which defaults to zero if unset */
  readonly index?: number;
  /** Labels to show for each item. */
  readonly labels: string[];
  /** Callback for when a new item is selected. */
  readonly onChange: (index: number) => void;
}

/**
 * @Component
 * @ExportModel({
 *  ios: 'SCCPickerActionSheet',
 *  android: 'com.snap.valdi.widgets.PickerActionSheet'
 * })
 */
export class PickerActionSheet extends StatefulComponent<PickerActionSheetViewModel, {}, {}> {
  override onCreate(): void {
    Device.performHapticFeedback(DeviceHapticFeedbackType.ACTION_SHEET);
  }

  override onRender(): void {
    <layout style={style.container}>
      <view style={style.content}>
        <label value={this.viewModel.title} style={style.title} />
        <layout paddingLeft={Spacing.MD} paddingRight={Spacing.MD} flexGrow={1}>
          <PickerView
            index={this.viewModel.index}
            labels={this.viewModel.labels}
            onChange={this.viewModel.onChange}
            height={this.calculateTargetHeight()}
          />
        </layout>
      </view>
      {when(Device.isIOS(), () => {
        <view style={style.backgroundFill} />;
      })}
    </layout>;
  }

  private calculateTargetHeight(): number {
    if (Device.isIOS()) {
      return Device.getDisplayHeight() * 0.4 - Device.getDisplayBottomInset() - Device.getDisplayTopInset();
    } else {
      return 260;
    }
  }
}

const style = {
  container: Device.isIOS()
    ? new Style<Layout>({
        display: 'flex',
      })
    : undefined,
  content: new Style<View>({
    backgroundColor: SemanticColor.Background.SURFACE,
    borderRadius: '24 24 0 0',
  }),
  title: new Style<Label>({
    font: TextStyleFont.CAPTION,
    color: SemanticColor.Text.SECONDARY,
    margin: Spacing.MD,
    textAlign: 'center',
  }),
  backgroundFill: new Style<View>({
    backgroundColor: SemanticColor.Background.SURFACE,
    flexGrow: 1,
    limitToViewport: false,
  }),
};
