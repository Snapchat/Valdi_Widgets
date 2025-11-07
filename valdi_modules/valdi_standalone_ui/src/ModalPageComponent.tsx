import { ComponentConstructor, IComponent } from 'valdi_core/src/IComponent';
import { Style } from 'valdi_core/src/Style';
import { INavigator } from 'navigation/src/INavigator';
import {
  getNavigationController,
  NavigationPageComponent,
  NavigationPageContext,
} from 'navigation/src/NavigationPageComponent';
import { View } from 'valdi_tsx/src/NativeTemplateElements';

export interface ModalPageViewComponentViewModel {
  // hack to pass through the dismiss action to the consumer
  receiveDismiss?: (dismiss: () => void) => void;
}

export abstract class ModalPageComponent<
  ViewModel extends ModalPageViewComponentViewModel,
  ComponentContext extends NavigationPageContext = {
    navigator: INavigator;
  },
> extends NavigationPageComponent<ViewModel, ComponentContext> {
  onCreate() {
    super.onCreate();

    this.viewModel.receiveDismiss?.(() => {
      this.navigationController.dismiss(true);
    });
  }

  onRender() {
    <view style={styles.root}>{this.onRenderPageContent()}</view>;
  }

  static presentModal<
    T extends ModalPageComponent<ViewModel, Context>,
    ViewModel extends ModalPageViewComponentViewModel,
    Context extends NavigationPageContext,
    ProvidedContext extends Context,
  >(
    inComponent: IComponent,
    componentClass: ComponentConstructor<T, ViewModel, Context>,
    viewModel: ViewModel,
    context: ProvidedContext,
  ) {
    let shouldDismiss = false;
    let receivedDismisser: (() => void) | undefined;
    const navigationController = getNavigationController(inComponent);

    viewModel.receiveDismiss = dismisser => {
      receivedDismisser = dismisser;
      if (shouldDismiss) {
        dismisser();
      }
    };

    navigationController.present(componentClass, viewModel, context, {
      animated: true,
      pageBackgroundColor: 'transparent',
    });

    return () => {
      shouldDismiss = true;
      receivedDismisser?.();
    };
  }
}

const styles = {
  root: new Style<View>({
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }),
};
