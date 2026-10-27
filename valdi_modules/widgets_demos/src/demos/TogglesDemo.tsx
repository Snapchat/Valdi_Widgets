import { StatefulComponent } from 'valdi_core/src/Component';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { Slider } from 'widgets/src/components/slider/Slider';
import { CoreJumboToggle } from 'widgets/src/components/toggle/CoreJumboToggle';
import { CoreToggle } from 'widgets/src/components/toggle/CoreToggle';
import { RadioToggle } from 'widgets/src/components/toggle/RadioToggle';
import { SelectorToggle } from 'widgets/src/components/toggle/SelectorToggle';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { DemoPage } from '../DemoPage';

const RADIO_OPTIONS = ['Everyone', 'Friends', 'Only me'];

interface TogglesDemoState {
  coreOn: boolean;
  jumboOn: boolean;
  radioIndex: number;
  selected: boolean[];
  sliderValue: number;
}

export class TogglesDemo extends StatefulComponent<{}, TogglesDemoState> {
  state: TogglesDemoState = {
    coreOn: true,
    jumboOn: false,
    radioIndex: 0,
    selected: [true, false, false],
    sliderValue: 0.5,
  };

  private toggleSelected(index: number): void {
    const selected = this.state.selected.slice();
    selected[index] = !selected[index];
    this.setState({ selected });
  }

  onRender(): void {
    const { coreOn, jumboOn, radioIndex, selected, sliderValue } = this.state;
    <DemoPage title='Toggles & Slider'>
      <Section title='CoreToggle'>
        <layout flexDirection='row' alignItems='center'>
          <CoreToggle accessibilityId='core-toggle' on={coreOn} onTap={() => this.setState({ coreOn: !coreOn })} />
          <label value={coreOn ? 'On' : 'Off'} font={TextStyleFont.BODY} margin='0 0 0 12' />
          <layout width={24} />
          <CoreToggle on={false} disabled />
          <label value='Disabled' font={TextStyleFont.BODY} color={SemanticColor.Text.SECONDARY} margin='0 0 0 12' />
        </layout>
      </Section>
      <SectionSeparator />
      <Section title='CoreJumboToggle'>
        <CoreJumboToggle on={jumboOn} onTap={() => this.setState({ jumboOn: !jumboOn })} />
      </Section>
      <SectionSeparator />
      <Section title='RadioToggle'>
        {RADIO_OPTIONS.forEach((option, index) => {
          <layout flexDirection='row' alignItems='center' padding='4 0'>
            <RadioToggle on={index === radioIndex} onTap={() => this.setState({ radioIndex: index })} />
            <label value={option} font={TextStyleFont.BODY} margin='0 0 0 8' />
          </layout>;
        })}
      </Section>
      <SectionSeparator />
      <Section title='SelectorToggle'>
        {selected.forEach((on, index) => {
          <layout flexDirection='row' alignItems='center' padding='4 0'>
            <SelectorToggle on={on} onTap={() => this.toggleSelected(index)} />
            <label value={`Option ${index + 1}`} font={TextStyleFont.BODY} margin='0 0 0 8' />
          </layout>;
        })}
      </Section>
      <SectionSeparator />
      <Section title='Slider'>
        <Slider initialValue={sliderValue} onChange={value => this.setState({ sliderValue: value })} />
        <label
          value={`Value: ${sliderValue.toFixed(2)}`}
          font={TextStyleFont.BODY}
          color={SemanticColor.Text.SECONDARY}
          margin='8 0 0 0'
        />
      </Section>
    </DemoPage>;
  }
}
