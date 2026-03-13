import { StatefulComponent } from 'valdi_core/src/Component';
import { DatePicker } from 'widgets/src/components/pickers/DatePicker';
import { TimePicker, TimePickerTime } from 'widgets/src/components/pickers/TimePicker';
import { IndexPicker } from 'widgets/src/components/pickers/IndexPicker';
import { EmojiLabel } from 'widgets/src/components/text/EmojiLabel';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

const FRUIT_LABELS = ['🍎 Apple', '🍌 Banana', '🍇 Grapes', '🍓 Strawberry', '🥭 Mango'];

interface CatalogState {
  date: Date;
  time: TimePickerTime;
  fruitIndex: number;
}

export class WidgetsCatalog extends StatefulComponent<{}, CatalogState, {}> {
  state: CatalogState = {
    date: new Date(),
    time: { hourOfDay: new Date().getHours(), minuteOfHour: 0 },
    fruitIndex: 0,
  };

  onRender(): void {
    const { date, time, fruitIndex } = this.state;
    const dateStr = date.toLocaleDateString();
    const timeStr = `${String(time.hourOfDay).padStart(2, '0')}:${String(time.minuteOfHour).padStart(2, '0')}`;
    const fruitLabel = FRUIT_LABELS[fruitIndex];

    <view padding='0 0 40 0'>
      <Section title='DatePicker'>
        <DatePicker
          date={date}
          onChange={e => this.setState({ date: e.date })}
        />
        <label
          value={`Selected: ${dateStr}`}
          font={TextStyleFont.BODY}
          color={SemanticColor.Text.SECONDARY}
          margin='8 0 0 0'
        />
      </Section>

      <SectionSeparator />

      <Section title='TimePicker'>
        <TimePicker
          time={time}
          intervalMinutes={15}
          onChange={e => this.setState({ time: e.pickedTime })}
        />
        <label
          value={`Selected: ${timeStr}`}
          font={TextStyleFont.BODY}
          color={SemanticColor.Text.SECONDARY}
          margin='8 0 0 0'
        />
      </Section>

      <SectionSeparator />

      <Section title='IndexPicker'>
        <IndexPicker
          labels={FRUIT_LABELS}
          index={fruitIndex}
          onChange={i => this.setState({ fruitIndex: i })}
        />
        <label
          value={`Selected: ${fruitLabel}`}
          font={TextStyleFont.BODY}
          color={SemanticColor.Text.SECONDARY}
          margin='8 0 0 0'
        />
      </Section>

      <SectionSeparator />

      <Section title='EmojiLabel'>
        <EmojiLabel value='🎉 Celebration!' font={TextStyleFont.TITLE_2} />
        <EmojiLabel value='🌍 Hello World 🌎' font={TextStyleFont.BODY} margin='8 0 0 0' />
        <EmojiLabel value='❤️ 🧡 💛 💚 💙 💜' font={TextStyleFont.TITLE_3} margin='8 0 0 0' />
      </Section>
    </view>;
  }
}
