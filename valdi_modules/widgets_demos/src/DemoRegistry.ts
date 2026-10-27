import { ComponentConstructor, IComponent } from 'valdi_core/src/IComponent';
import { PlaygroundApp } from 'playground/src/PlaygroundApp';
import { ButtonsDemo } from './demos/ButtonsDemo';
import { CardsDemo } from './demos/CardsDemo';
import { CellsDemo } from './demos/CellsDemo';
import { InputsDemo } from './demos/InputsDemo';
import { MotionDemo } from './demos/MotionDemo';
import { PickersDemo } from './demos/PickersDemo';
import { TogglesDemo } from './demos/TogglesDemo';

export interface WidgetDemo {
  /** Stable, URL-safe id; the web playground routes to `#/<id>`. */
  id: string;
  title: string;
  description: string;
  component: ComponentConstructor<IComponent>;
}

export const WIDGET_DEMOS: readonly WidgetDemo[] = [
  {
    id: 'buttons',
    title: 'Buttons',
    description: 'CoreButton, PillButton, ConfirmationButton, Checkbox',
    component: ButtonsDemo,
  },
  {
    id: 'toggles',
    title: 'Toggles & Slider',
    description: 'CoreToggle, CoreJumboToggle, RadioToggle, SelectorToggle, Slider',
    component: TogglesDemo,
  },
  {
    id: 'inputs',
    title: 'Inputs',
    description: 'CoreTextField, SearchBox, PillTextField',
    component: InputsDemo,
  },
  {
    id: 'cells',
    title: 'Cells & Sections',
    description: 'Cell slots and packings, Section, HorizontalRule',
    component: CellsDemo,
  },
  {
    id: 'cards',
    title: 'Cards & Tooltips',
    description: 'Card, TooltipInlined',
    component: CardsDemo,
  },
  {
    id: 'motion',
    title: 'Text, Images & Motion',
    description: 'TextStyleFont, EmojiLabel, res assets, AnimationRotate, AnimationShimmer, DataSyncingBar',
    component: MotionDemo,
  },
  {
    id: 'pickers',
    title: 'Pickers',
    description: 'DatePicker, TimePicker, IndexPicker, FilePicker (web polyglot views)',
    component: PickersDemo,
  },
  {
    id: 'playground',
    title: 'Playground app',
    description: 'The full PlaygroundApp root component used by the native playground',
    component: PlaygroundApp,
  },
];

export function findWidgetDemo(id: string): WidgetDemo | undefined {
  return WIDGET_DEMOS.find(demo => demo.id === id);
}
