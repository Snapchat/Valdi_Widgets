/**
 * Runtime bootstrap. Uses require() rather than import so evaluation order is explicit: the runtime stub must exist
 * before any compiled module evaluates, and the renderer must boot the Valdi runtime before native modules register.
 */

require('valdi-web-devtools/setup');

require('valdi_widgets_web_npm/src/_navigation_registry');
require('valdi_widgets_web_npm/src/_worker_registry');
require('valdi_widgets_web_npm/src/_image_registry');

const { ValdiWebRenderer } = require('valdi_widgets_web_npm/src/web_renderer/src/ValdiWebRenderer');

// Installs the widgets' web polyglot views (DatePicker, TimePicker, IndexPicker, FilePicker, EmojiLabel).
require('valdi_widgets_web_npm/src/RegisterNativeModules');

const { ComponentPrototype } = require('valdi_widgets_web_npm/src/valdi_core/src/ComponentPrototype');
const { registerSemanticColors } = require('valdi_widgets_web_npm/src/widgets/src/RegisterSemanticColors');
const { setTheme } = require('valdi_widgets_web_npm/src/widgets/src/InitSemanticColors');
const { ThemeLight } = require('valdi_widgets_web_npm/src/widgets/src/ColorSpec');

registerSemanticColors();
setTheme(ThemeLight, false);

declare const module: { hot?: unknown };
if (module.hot) {
  const { attachHmr } = require('valdi-web-devtools');
  attachHmr(ValdiWebRenderer, {
    newPrototype: () => ComponentPrototype.instanceWithNewId(),
  });
}

export { ComponentPrototype, ValdiWebRenderer };
