import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Label, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';

import { Playground } from './Playground';

/**
 * @ViewModel
 * @ExportModel({ ios: 'ValdiStartViewComponentViewModel', android: 'com.snap.valdi.helloworld.StartViewComponentViewModel'})
 */
export interface StartComponentViewModel {}

/**
 * @Context
 * @ExportModel({ios: 'ValdiStartViewComponentContext', android: 'com.snap.valdi.helloworld.StartViewComponentContext'})
 */
export interface StartComponentContext {
}

/**
 * @Component
 * @ExportModel({ios: 'ValdiStartView', android: 'com.snap.valdi.helloworld.StartView'})
 */
export class PlaygroundApp extends Component<
  StartComponentViewModel,
  StartComponentContext
> {
  onCreate(): void {
    console.log('Playground onCreate');
  }

  onRender(): void {
    console.log('Playground onRender');
    <Playground context={{}}/>
  }
}

const styles = {
  scroll: new Style<ScrollView>({
    alignItems: 'center',
    height: '100%',
  }),

  title: new Style<Label>({
    color: 'black',
    accessibilityCategory: 'header',
    width: '100%',
  }),
};
