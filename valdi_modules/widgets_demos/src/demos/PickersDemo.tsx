import { Component } from 'valdi_core/src/Component';
import { WidgetsCatalog } from 'playground/src/WidgetsCatalog';
import { DemoPage } from '../DemoPage';

/**
 * Pickers and EmojiLabel are polyglot custom views; on web they render through the factories in
 * widgets/web/src/WidgetsWeb.ts, which RegisterNativeModules installs at bundle load.
 */
export class PickersDemo extends Component<{}> {
  onRender(): void {
    <DemoPage title='Pickers' subtitle='Polyglot custom views backed by native inputs on web.'>
      <WidgetsCatalog context={{}} />
    </DemoPage>;
  }
}
