import { StatefulComponent } from 'valdi_core/src/Component';
import { CoreTextField } from 'widgets/src/components/inputs/CoreTextField';
import { PillTextField, PillTextFieldItem } from 'widgets/src/components/inputs/PillTextField';
import { SearchBox } from 'widgets/src/components/inputs/SearchBox';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { DemoPage } from '../DemoPage';

interface InputsDemoState {
  name: string;
  query: string;
  pills: string[];
  pillInput: string;
}

export class InputsDemo extends StatefulComponent<{}, InputsDemoState> {
  state: InputsDemoState = {
    name: '',
    query: '',
    pills: ['Alice', 'Bob'],
    pillInput: '',
  };

  private addPill = (): void => {
    const value = this.state.pillInput.trim();
    if (!value) {
      return;
    }
    this.setState({ pills: [...this.state.pills, value], pillInput: '' });
  };

  private removePill(index: number): void {
    this.setState({ pills: this.state.pills.filter((_, i) => i !== index) });
  }

  onRender(): void {
    const { name, query, pills, pillInput } = this.state;
    const pillItems: PillTextFieldItem[] = pills.map((label, index) => ({
      label,
      onTap: () => this.removePill(index),
    }));
    <DemoPage title='Inputs'>
      <Section title='CoreTextField'>
        <CoreTextField
          accessibilityId='core-text-field'
          placeholder='Display name'
          text={name}
          onChange={e => this.setState({ name: e.text })}
        />
        <label
          value={name ? `Hello, ${name}` : 'Type a name'}
          font={TextStyleFont.BODY}
          color={SemanticColor.Text.SECONDARY}
          margin='8 0 0 0'
        />
      </Section>
      <SectionSeparator />
      <Section title='SearchBox'>
        <SearchBox
          placeholder='Search'
          inputValue={query}
          onChange={e => this.setState({ query: e.value })}
          onResetQuery={() => this.setState({ query: '' })}
        />
        <label
          value={query ? `Query: ${query}` : 'No query'}
          font={TextStyleFont.BODY}
          color={SemanticColor.Text.SECONDARY}
          margin='8 0 0 0'
        />
      </Section>
      <SectionSeparator />
      <Section title='PillTextField' description='Press return to add a pill, tap a pill to remove it.'>
        <PillTextField
          decorationText='To:'
          pills={pillItems}
          inputValue={pillInput}
          inputPlaceholder='Add a name'
          onInputChange={e => this.setState({ pillInput: e.text })}
          onInputReturn={this.addPill}
          onInputClear={() => this.setState({ pillInput: '' })}
        />
      </Section>
    </DemoPage>;
  }
}
