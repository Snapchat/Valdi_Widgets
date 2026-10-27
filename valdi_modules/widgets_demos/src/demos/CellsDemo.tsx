import { StatefulComponent } from 'valdi_core/src/Component';
import { CoreButton, CoreButtonColoring, CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { Cell, CellSlotType } from 'widgets/src/components/cell/Cell';
import { CellPacking } from 'widgets/src/components/cell/style';
import { HorizontalRule } from 'widgets/src/components/rules/HorizontalRule';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { CoreToggle } from 'widgets/src/components/toggle/CoreToggle';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { DemoPage } from '../DemoPage';

const PACKINGS = [CellPacking.Small50, CellPacking.Medium56, CellPacking.Large66, CellPacking.Large70, CellPacking.Spacious];

const PEOPLE = [
  { name: 'Ada Lovelace', username: 'ada', color: SemanticColor.Brand.PRIMARY },
  { name: 'Alan Turing', username: 'alan', color: SemanticColor.Brand.SECONDARY },
  { name: 'Grace Hopper', username: 'grace', color: SemanticColor.Brand.PRIMARY },
];

interface CellsDemoState {
  added: boolean[];
  notifications: boolean;
}

export class CellsDemo extends StatefulComponent<{}, CellsDemoState> {
  state: CellsDemoState = {
    added: PEOPLE.map(() => false),
    notifications: true,
  };

  private toggleAdded(index: number): void {
    const added = this.state.added.slice();
    added[index] = !added[index];
    this.setState({ added });
  }

  onRender(): void {
    const { added, notifications } = this.state;
    <DemoPage title='Cells & Sections'>
      <Section
        title='People'
        subtitle='Cell with accessories'
        actionButton={{ label: 'Reset', onTap: () => this.setState({ added: PEOPLE.map(() => false) }) }}
        fullBleed
      >
        {PEOPLE.forEach((person, index) => {
          <Cell title={person.name} identityTitle={person.username} subtitle='Suggested friend'>
            <slotted slot={CellSlotType.Default}>
              <view width={40} height={40} borderRadius={20} backgroundColor={person.color} />
            </slotted>
            <slotted slot={CellSlotType.AccessoryRight}>
              <CoreButton
                text={added[index] ? 'Added' : 'Add'}
                coloring={added[index] ? CoreButtonColoring.SECONDARY : CoreButtonColoring.PRIMARY}
                sizing={CoreButtonSizing.SMALL}
                onTap={() => this.toggleAdded(index)}
              />
            </slotted>
          </Cell>;
          <HorizontalRule />;
        })}
      </Section>
      <SectionSeparator />
      <Section title='Settings' fullBleed>
        <Cell title='Notifications' subtitle={notifications ? 'On' : 'Off'} accessoryWidth={0} accessoryMarginRight={0}>
          <slotted slot={CellSlotType.AccessoryRight}>
            <CoreToggle on={notifications} onTap={() => this.setState({ notifications: !notifications })} />
          </slotted>
        </Cell>
      </Section>
      <SectionSeparator />
      <Section title='Packing' fullBleed>
        {PACKINGS.forEach(packing => {
          <Cell title={`packing = ${packing}`} subtitle={['Subtitle', 'with delimiter']} packing={packing} accessoryWidth={0} accessoryMarginRight={0} />;
          <HorizontalRule />;
        })}
      </Section>
    </DemoPage>;
  }
}
