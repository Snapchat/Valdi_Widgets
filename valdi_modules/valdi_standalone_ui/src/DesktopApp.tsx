import { StatefulComponent } from 'valdi_core/src/Component';
import { jsx } from 'valdi_core/src/JSXBootstrap';
import { NavigationView, NavigationViewContext } from 'navigation_internal/src/NavigationView';
import { ArgumentsParser } from 'valdi_standalone/src/ArgumentsParser';
import { mockNativeModules } from 'valdi_standalone/src/NativeModules';
import { DesktopMessageHandler } from './DesktopMessageHandler';

type WindowPosition = 'current' | 'center';

interface Context {
  setWindowSize(width: number, height: number, position: WindowPosition, callback: () => void): void;
  exit(code: number): void;
  setApplicationId(applicationId: string): void;
  programArguments: string[];
  componentContext: any;
}

function parseWindowSize(value: string): [number, number] {
  const components = value.split('x');
  if (components.length !== 2) {
    throw new Error('Window size should be in the form like 800x600');
  }

  const width = parseFloat(components[0]);
  const height = parseFloat(components[1]);

  return [width, height];
}

interface State {
  navigationViewContext?: NavigationViewContext;
}

const DEFAULT_WINDOW_SIZE = [800, 600];
mockNativeModules();

export class DesktopApp extends StatefulComponent<{}, State, Context> {
  state: State = {};
  messageHandler = new DesktopMessageHandler();

  onCreate() {
    jsx.addCustomMessageHandler(this.messageHandler);

    const argumentsParser = new ArgumentsParser('ValdiDesktop', this.context.programArguments);

    const viewModelArg = argumentsParser.add(
      '--view_model',
      'The view model to provide to the root component',
      false,
      JSON.parse,
    );
    const rootComponentPath = argumentsParser.add(
      '--root_component',
      'The component path to the root component to display. Should be in form ComponentName@module/src/File',
      true,
    );
    const windowSize = argumentsParser.add(
      '--window_size',
      'The initial size of the window, e.g. 800x600',
      false,
      parseWindowSize,
    );

    try {
      argumentsParser.parse();
    } catch (err: any) {
      this.context.exit(1);
      return;
    }

    const rootComponentPathValue = rootComponentPath.value!;
    this.context.setApplicationId(rootComponentPathValue);

    const windowSizeToSet = windowSize.value ?? DEFAULT_WINDOW_SIZE;
    this.context.setWindowSize(windowSizeToSet[0], windowSizeToSet[1], 'center', () => {
      this.setState({
        navigationViewContext: {
          rootComponentPath: rootComponentPathValue,
          rootViewModel: viewModelArg.value,
          rootContext: this.context.componentContext,
          hideBackButton: false,
        },
      });
    });
  }

  onDestroy() {
    jsx.removeCustomMessageHandler(this.messageHandler);
  }

  onRender() {
    if (this.state.navigationViewContext) {
      <NavigationView context={this.state.navigationViewContext} />;
    }
  }
}
