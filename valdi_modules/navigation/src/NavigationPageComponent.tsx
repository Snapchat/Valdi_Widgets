import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { IComponent } from 'valdi_core/src/IComponent';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { INavigator } from './INavigator';
import { NavigationController, NavigationOptions } from './NavigationController';

export interface NavigationPageContext {
  navigator: INavigator;
  pageNavigationOptions?: NavigationOptions;
}

function sharedOnRender(pageNavigationOptions: NavigationOptions | undefined, renderPageContent: () => void) {
  const backgroundColor = pageNavigationOptions?.pageBackgroundColor ?? SemanticColor.Background.MAIN;
  <view backgroundColor={backgroundColor} width='100%' height='100%'>
    {renderPageContent()}
  </view>;
}

export interface INavigationComponent extends IComponent {
  navigationController: NavigationController;
}

/**
 * Subclass this component and implement `onRenderPageContent` instead of `onRender` to render the page content.
 */
export abstract class NavigationPageComponent<
    ViewModel,
    ComponentContext extends NavigationPageContext = {
      navigator: INavigator;
    },
  >
  extends Component<ViewModel, ComponentContext>
  implements INavigationComponent
{
  static componentPath: string;
  navigationController: NavigationController = new NavigationController(this.context.navigator);

  abstract onRenderPageContent(): void;

  private boundRenderPageContent = this.onRenderPageContent.bind(this);
  onRender() {
    sharedOnRender(this.context.pageNavigationOptions, this.boundRenderPageContent);
  }
}

/**
 * Subclass this component and implement `onRenderPageContent` instead of `onRender` to render the page content.
 */
export abstract class NavigationPageStatefulComponent<
    ViewModel,
    State,
    ComponentContext extends NavigationPageContext = {
      navigator: INavigator;
    },
  >
  extends StatefulComponent<ViewModel, State, ComponentContext>
  implements INavigationComponent
{
  static componentPath: string;
  navigationController: NavigationController = new NavigationController(this.context.navigator);

  abstract onRenderPageContent(): void;

  private boundRenderPageContent = this.onRenderPageContent.bind(this);
  onRender() {
    sharedOnRender(this.context.pageNavigationOptions, this.boundRenderPageContent);
  }
}

/**
 * Resolves the NavigationController from the current component.
 * Will throw if the navigator cannot be resolved
 * @param component
 */
export function getNavigationController(component: IComponent): NavigationController {
  const navigationComponent = getNavigationComponent(component);
  return navigationComponent.navigationController;
}

export function getNavigationComponent(component: IComponent): INavigationComponent {
  const navigationComponent = component as INavigationComponent;
  if (navigationComponent.navigationController) {
    return navigationComponent;
  }
  const parent = component.renderer.getComponentParent(component);
  if (!parent) {
    throw new Error('Could not resolve navigator');
  }
  return getNavigationComponent(parent);
}
