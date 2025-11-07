import { Component } from 'valdi_core/src/Component';
import { IComponentTestDriver, valdiIt } from 'valdi_test/test/JSXTestUtils';
import { findNodeWithKey } from 'foundation/test/util/findNodeWithKey';
import { tapNodeWithKey } from 'foundation/test/util/tapNodeWithKey';
import { waitForNodeWithKey } from 'foundation/test/util/waitForNodeWithKey';
import { INavigator } from 'navigation/src/INavigator';
import { NavigationController } from 'navigation/src/NavigationController';
import { NavigationPage } from 'navigation/src/NavigationPage';
import { NavigationPageComponent } from 'navigation/src/NavigationPageComponent';
import { getMockNavigation } from './Navigator';

export class RootComponent extends Component<{}, { navigator: INavigator }> {
  private readonly navigationController = new NavigationController(this.context.navigator);

  onRender(): void {
    <layout key='root'>
      <view key='pushButton' onTap={this.onPush} />
      <view key='popButton' onTap={this.onPop} />
      <view key='popToSelfButton' onTap={this.onPopToSelf} />
      <view key='presentButton' onTap={this.onPresent} />
    </layout>;
  }

  private onPush = (): void => {
    this.navigationController.push(AnotherComponent, {}, {});
  };
  private onPop = (): void => {
    this.navigationController.pop();
  };
  private onPopToSelf = (): void => {
    this.navigationController.popToSelf();
  };
  private onPresent = (): void => {
    this.navigationController.present(AnotherComponent, {}, {});
  };
}

@NavigationPage(module)
export class AnotherComponent extends NavigationPageComponent<{}> {
  onRenderPageContent(): void {
    <layout key='another'>
      <view key='pushButton' onTap={this.onPush} />
      <view key='popButton' onTap={this.onPop} />
      <view key='popToSelfButton' onTap={this.onPopToSelf} />
      <view key='popToRootButton' onTap={this.onPopToRoot} />
      <view key='presentButton' onTap={this.onPresent} />
      <view key='dismissButton' onTap={this.onDismiss} />
    </layout>;
  }

  private onPush = (): void => {
    this.navigationController.push(AnotherComponent, {}, {});
  };
  private onPop = (): void => {
    this.navigationController.pop();
  };
  private onPopToSelf = (): void => {
    this.navigationController.popToSelf();
  };
  private onPopToRoot = (): void => {
    this.navigationController.popToRoot();
  };
  private onPresent = (): void => {
    this.navigationController.present(AnotherComponent, {}, {});
  };
  private onDismiss = (): void => {
    this.navigationController.dismiss(false);
  };
}

const setUpRootPage = (
  driver: IComponentTestDriver,
  navigation: ReturnType<typeof getMockNavigation>,
): RootComponent => {
  const rootComponent = driver.renderComponent(RootComponent, {}, { navigator: navigation.rootNavigator });
  navigation.setRootPage(rootComponent);
  return rootComponent;
};

describe('Navigator', () => {
  valdiIt('should handle a root page', async driver => {
    const navigation = getMockNavigation();
    const rootComponent = setUpRootPage(driver, navigation);

    expect(findNodeWithKey(rootComponent, 'root')).toHaveSize(1);
    expect(navigation.currentComponent).toBe(rootComponent);
  });

  valdiIt('should be able to push and pop pages', async driver => {
    const navigation = getMockNavigation();
    const rootComponent = setUpRootPage(driver, navigation);

    // Push another page
    await tapNodeWithKey(rootComponent, 'pushButton');
    await waitForNodeWithKey(navigation.currentComponent, 'another');

    // Pop the page
    await tapNodeWithKey(navigation.currentComponent, 'popButton');
    // Now we should be back to the root page
    await waitForNodeWithKey(navigation.currentComponent, 'root');
  });

  valdiIt('should be able to pop to self', async driver => {
    const navigation = getMockNavigation();
    const rootComponent = setUpRootPage(driver, navigation);

    // Push 3 page
    await tapNodeWithKey(rootComponent, 'pushButton');
    await tapNodeWithKey(rootComponent, 'pushButton');
    await tapNodeWithKey(rootComponent, 'pushButton');
    // Now we should have 4 pages in the stack
    expect(navigation.currentStack).toHaveSize(4);

    // PopToSelf from the second page
    const secondPage = navigation.currentStack![1]!.component;
    await tapNodeWithKey(secondPage, 'popToSelfButton');
    // Now we should have 2 pages in the stack
    expect(navigation.currentStack).toHaveSize(2);
    expect(navigation.currentComponent).toBe(secondPage);
  });

  valdiIt('should be able to pop to root', async driver => {
    const navigation = getMockNavigation();
    const rootComponent = setUpRootPage(driver, navigation);

    // Push another page
    await tapNodeWithKey(rootComponent, 'pushButton');
    await tapNodeWithKey(rootComponent, 'pushButton');
    expect(navigation.currentStack).toHaveSize(3);

    // Pop to root
    await tapNodeWithKey(navigation.currentComponent, 'popToRootButton');
    // Now we should be back to the root page
    await waitForNodeWithKey(navigation.currentComponent, 'root');
    expect(navigation.currentStack).toHaveSize(1);
  });

  valdiIt('should be able to present and dismiss pages', async driver => {
    const navigation = getMockNavigation();
    const rootComponent = setUpRootPage(driver, navigation);

    // Present another page as a new root
    await tapNodeWithKey(rootComponent, 'presentButton');
    await waitForNodeWithKey(navigation.currentComponent, 'another');

    // Push some pages in the new stack root
    await tapNodeWithKey(navigation.currentComponent, 'pushButton');
    await tapNodeWithKey(navigation.currentComponent, 'pushButton');

    // Dismiss the new stack
    await tapNodeWithKey(navigation.currentComponent, 'dismissButton');
    // Now we should be back to the root page
    await waitForNodeWithKey(navigation.currentComponent, 'root');
  });
});
