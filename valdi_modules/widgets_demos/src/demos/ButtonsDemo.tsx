import { StatefulComponent } from 'valdi_core/src/Component';
import { Checkbox } from 'widgets/src/components/button/Checkbox';
import { ConfirmationButton } from 'widgets/src/components/button/ConfirmationButton';
import { CoreButton, CoreButtonColoring, CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { PillButton } from 'widgets/src/components/button/PillButton';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { DemoPage } from '../DemoPage';

const COLORINGS = [
  CoreButtonColoring.PRIMARY,
  CoreButtonColoring.SECONDARY,
  CoreButtonColoring.TERTIARY,
  CoreButtonColoring.INACTIVE,
  CoreButtonColoring.BRANDED,
  CoreButtonColoring.DEFAULT,
];

const SIZINGS = [
  CoreButtonSizing.XL,
  CoreButtonSizing.LARGE,
  CoreButtonSizing.MEDIUM,
  CoreButtonSizing.SMALL,
  CoreButtonSizing.TINY,
];

const PILLS = ['All', 'Friends', 'Stories', 'Spotlight'];

interface ButtonsDemoState {
  taps: number;
  selectedPill: number;
  checked: boolean;
  confirming: boolean;
}

export class ButtonsDemo extends StatefulComponent<{}, ButtonsDemoState> {
  state: ButtonsDemoState = {
    taps: 0,
    selectedPill: 0,
    checked: false,
    confirming: false,
  };

  private onTap = (): void => {
    this.setState({ taps: this.state.taps + 1 });
  };

  private onConfirm = (): void => {
    this.setState({ confirming: true });
    this.setTimeoutDisposable(() => this.setState({ confirming: false }), 1500);
  };

  onRender(): void {
    const { taps, selectedPill, checked, confirming } = this.state;
    <DemoPage title='Buttons' subtitle={`Taps: ${taps}`}>
      <Section title='CoreButton colorings'>
        {COLORINGS.forEach(coloring => {
          <layout margin='0 0 8 0' alignItems='flex-start'>
            <CoreButton
              accessibilityId={`core-button-${coloring}`}
              text={coloring}
              coloring={coloring}
              sizing={CoreButtonSizing.MEDIUM}
              onTap={this.onTap}
            />
          </layout>;
        })}
      </Section>
      <SectionSeparator />
      <Section title='CoreButton sizings'>
        {SIZINGS.forEach(sizing => {
          <layout margin='0 0 8 0' alignItems='flex-start'>
            <CoreButton text={sizing} coloring={CoreButtonColoring.PRIMARY} sizing={sizing} onTap={this.onTap} />
          </layout>;
        })}
      </Section>
      <SectionSeparator />
      <Section title='CoreButton states'>
        <layout flexDirection='row' alignItems='center'>
          <CoreButton text='Loading' loading coloring={CoreButtonColoring.PRIMARY} sizing={CoreButtonSizing.SMALL} />
          <layout width={8} />
          <CoreButton text='Disabled' disabled coloring={CoreButtonColoring.PRIMARY} sizing={CoreButtonSizing.SMALL} />
        </layout>
      </Section>
      <SectionSeparator />
      <Section title='PillButton'>
        <layout flexDirection='row' flexWrap='wrap'>
          {PILLS.forEach((pill, index) => {
            <layout margin='0 8 8 0'>
              <PillButton text={pill} selected={index === selectedPill} onTap={() => this.setState({ selectedPill: index })} />
            </layout>;
          })}
        </layout>
      </Section>
      <SectionSeparator />
      <Section title='ConfirmationButton'>
        <ConfirmationButton text='Confirm' loading={confirming} onTap={this.onConfirm} />
      </Section>
      <SectionSeparator />
      <Section title='Checkbox'>
        <layout flexDirection='row' alignItems='center'>
          <Checkbox on={checked} onTap={on => this.setState({ checked: on })} />
          <label
            value={checked ? 'Checked' : 'Unchecked'}
            font={TextStyleFont.BODY}
            color={SemanticColor.Text.SECONDARY}
            margin='0 0 0 8'
          />
        </layout>
      </Section>
    </DemoPage>;
  }
}
