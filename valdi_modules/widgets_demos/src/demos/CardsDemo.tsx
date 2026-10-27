import { StatefulComponent } from 'valdi_core/src/Component';
import { Card, CardShadow } from 'widgets/src/components/card/Card';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { TooltipInlined } from 'widgets/src/components/tooltip/TooltipInlined';
import { TooltipPosition } from 'widgets/src/components/tooltip/TooltipPosition';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { DemoPage } from '../DemoPage';

const TOOLTIP_POSITIONS = [TooltipPosition.TopLeft, TooltipPosition.TopCenter, TooltipPosition.BottomRight];

interface CardsDemoState {
  cardTaps: number;
}

export class CardsDemo extends StatefulComponent<{}, CardsDemoState> {
  state: CardsDemoState = { cardTaps: 0 };

  onRender(): void {
    const { cardTaps } = this.state;
    <DemoPage title='Cards & Tooltips'>
      <Section title='Card'>
        <Card padding={16} margin='0 0 12 0' onTap={() => this.setState({ cardTaps: cardTaps + 1 })}>
          <label value='Tappable card with default shadow' font={TextStyleFont.TITLE_4} />
          <label
            value={`Tapped ${cardTaps} time${cardTaps === 1 ? '' : 's'}`}
            font={TextStyleFont.BODY}
            color={SemanticColor.Text.SECONDARY}
            margin='4 0 0 0'
          />
        </Card>
        <Card padding={16} shadow={CardShadow.NONE} borderWidth={1} borderColor={SemanticColor.Layout.DIVIDER}>
          <label value='Flat card with a border' font={TextStyleFont.TITLE_4} />
        </Card>
      </Section>
      <SectionSeparator />
      <Section title='TooltipInlined'>
        {TOOLTIP_POSITIONS.forEach(position => {
          <layout margin='0 0 12 0' alignItems='flex-start'>
            <TooltipInlined text={`Tooltip ${position}`} position={position} />
          </layout>;
        })}
      </Section>
    </DemoPage>;
  }
}
