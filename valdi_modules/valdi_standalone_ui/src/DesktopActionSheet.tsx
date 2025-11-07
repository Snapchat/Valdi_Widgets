import { IComponent } from 'valdi_core/src/IComponent';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { EditTextEvent, Label, View } from 'valdi_tsx/src/NativeTemplateElements';
import { ConfirmationButton } from 'widgets/src/components/button/ConfirmationButton';
import { CoreTextField } from 'widgets/src/components/inputs/CoreTextField';
import { Spacing } from 'widgets/src/styles/spacing';
import { NavigationPage } from 'navigation/src/NavigationPage';
import { ModalPageComponent, ModalPageViewComponentViewModel } from './ModalPageComponent';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';

interface ViewModel extends ModalPageViewComponentViewModel {
  title: string | undefined;
  subtitle: string | undefined;
  renderFunctions: (() => void)[];
}



@NavigationPage(module)
export class DesktopActionSheetComponent extends ModalPageComponent<ViewModel> {
  onRenderPageContent() {
    <view style={styles.root}>
      {when(this.viewModel.title, title => {
        <label style={styles.title} value={title} />;
      })}
      {when(this.viewModel.subtitle, subtitle => {
        <label style={styles.subtitle} value={subtitle} />;
      })}
      {this.viewModel.renderFunctions.forEach(render => {
        <layout height={Spacing.MD} />;
        render();
      })}
    </view>;
  }
}

const styles = {
  root: new Style<View>({
    backgroundColor: 'white',
    borderRadius: 20,
    padding: Spacing.MD,
    boxShadow: '10 10 2 rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  }),
  title: new Style<Label>({
    font: TextStyleFont.TITLE_1
  }),
  subtitle: new Style<Label>({
    font: TextStyleFont.TITLE_2
  }),
};

export interface TextFieldAction {
  value: string;
}

const TEXT_FIELD_WIDTH = 300;

export class DesktopActionSheet {
  private renderFunctions: (() => void)[] = [];

  private dismisser?: () => void;

  constructor(readonly title?: string, readonly subtitle?: string) {}

  addButton(title: string, cb: () => void) {
    this.renderFunctions.push(() => {
      <ConfirmationButton text={title} onTap={cb} />;
    });
  }

  addTextField(placeholder?: string, initialValue?: string): TextFieldAction {
    const holder: TextFieldAction = { value: '' };
    const onChange = (value: EditTextEvent) => {
      holder.value = value.text;
    };

    this.renderFunctions.push(() => {
      <layout width={TEXT_FIELD_WIDTH}>
        <CoreTextField placeholder={placeholder} text={initialValue} onChange={onChange} />;
      </layout>;
    });

    return holder;
  }

  present(inComponent: IComponent) {
    this.dismisser = ModalPageComponent.presentModal(
      inComponent,
      DesktopActionSheetComponent,
      {
        title: this.title,
        subtitle: this.subtitle,
        renderFunctions: [...this.renderFunctions],
      },
      undefined,
    );
  }

  dismiss() {
    this.dismisser?.();
  }

  static presentAlert(component: IComponent, title?: string, subtitle?: string) {
    const actionSheet = new DesktopActionSheet(title, subtitle);
    actionSheet.addButton('OK', () => {
      actionSheet.dismiss();
    });
    actionSheet.present(component);
  }
}

