import { StatefulComponent } from 'valdi_core/src/Component';
import { parseComponentPath, resolveComponentConstructor } from 'valdi_core/src/ComponentPath';
import { ComponentRef } from 'valdi_core/src/ComponentRef';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { ComponentConstructor, IComponent } from 'valdi_core/src/IComponent';
import { getModuleLoader } from 'valdi_core/src/ModuleLoaderGlobal';
import { Style } from 'valdi_core/src/Style';
import { DefaultErrorBoundary } from 'valdi_core/src/debugging/DefaultErrorBoundary';
import { onIdleInterruptible } from 'valdi_core/src/utils/OnIdle';
import { when } from 'valdi_core/src/utils/When';
import { SerialTaskQueue } from 'coreutils/src/SerialTaskQueue';
import { StringSet } from 'coreutils/src/StringSet';
import { Lazy } from 'foundation/src/Lazy';
import { INavigator, INavigatorPageConfig, JSOnlyINavigator } from 'navigation/src/INavigator';
import { NavigationPageContext } from 'navigation/src/NavigationPageComponent';
import { Layout, View } from 'valdi_tsx/src/NativeTemplateElements';

export interface NavigationViewContext {
  rootComponentPath: string;
  rootViewModel: any;
  rootContext: any;
  hideBackButton: boolean;
}

interface ComponentStackEntry {
  key: string;
  ctor: Lazy<ComponentConstructor<IComponent>>;
  componentPath: string;
  viewModel: any;
  context: any;
  title: string;
  ref: ComponentRef<IComponent>;
  viewContainerRef: ElementRef<View>;
  occlusionViewRef: ElementRef<View>;
  hotReloadObserver: () => void;
  isModal: boolean;
  isTransparent: boolean;
}

interface State {
  stack: ComponentStackEntry[];
}

const ANIMATION_DURATION = 0.25;

// TODO: use types from navigation/src/NavigationController
interface NavigationInfo {
  valdiPath?: string;
  componentPath?: string;
  bundleName?: string;
  viewModel?: any;
  context?: any;
  animated?: boolean;
  newNavigationTitle?: string;
  hasTransparentBackground: boolean;
}
interface NavigationPush extends NavigationInfo {}
interface NavigationPresent extends NavigationInfo {}

type NavigationOperation = (done: () => void) => void;

export class NavigationView extends StatefulComponent<{}, State, NavigationViewContext> {
  state: State = { stack: [] };

  private keySequence = 0;
  private scheduledRebuild = false;
  private hotReloadedComponents: StringSet = {};
  private containerRef = new ElementRef<Layout>();
  private taskQueue = new SerialTaskQueue();

  onCreate() {
    this.pushComponent(
      this.context.rootComponentPath,
      this.context.rootViewModel,
      this.context.rootContext,
      '',
      true,
      false,
      false,
    );
  }

  onDestroy() {
    for (const item of this.state.stack) {
      this.teardownStackEntry(item);
    }
  }

  onRender() {
    const topItem = this.state.stack[this.state.stack.length - 1];
    const showsBackButton = this.state.stack.length > 1 && !this.context.hideBackButton;

    <view backgroundColor='white' width={'100%'} height={'100%'}>
      <layout style={style.itemContainer} ref={this.containerRef}>
        {this.renderNavigationStack()}
      </layout>
    </view>;
  }

  private onBack = () => {
    this.pop(true);
  };

  private renderNavigationStack() {
    const topItem = this.getCurrentItem();
    for (const item of this.state.stack) {
      <view key={item.key} style={style.item} ref={item.viewContainerRef}>
        <DefaultErrorBoundary>
          <item.ctor.target context={item.context} ref={item.ref} {...item.viewModel} />
          {this.setupItem(item.ref)}
        </DefaultErrorBoundary>
        {when(item !== topItem, () => {
          <view style={style.occlusionOverlay} ref={item.occlusionViewRef} />;
        })}
      </view>;
    }
  }

  private setupItem(ref: ComponentRef<IComponent>) {
    const component = ref.single();
    if (!component) {
      return;
    }

    this.injectNavigationActions(component);

    const elements = this.renderer.getComponentRootElements(component, false);
    for (const element of elements) {
      element.setAttribute('$width', '100%');
      element.setAttribute('$height', '100%');
    }
  }

  private injectNavigationActions(component: IComponent) {
    // eslint-disable-next-line no-prototype-builtins
    if (component.hasOwnProperty('callAction')) {
      return;
    }

    const originalCallAction = (component as any).callAction;
    if (!originalCallAction) {
      return;
    }

    (component as any).callAction = (actionName: string, parameters: any[]) => {
      if (actionName === 'push') {
        this.doPush(parameters[0]);
      } else if (actionName === 'present') {
        this.doPresent(parameters[0]);
      } else if (actionName === 'back') {
        this.doBack(parameters[0]);
      } else if (actionName === 'dismiss') {
        this.doDismiss(parameters[0]);
      } else if (actionName === 'setNavigationTitle') {
        this.doSetNavigationTitle(parameters[0]);
      } else {
        return originalCallAction(actionName, parameters);
      }
    };
  }

  private doPush(push: NavigationPush) {
    this.pushComponent(
      push.componentPath!,
      push.viewModel,
      push.context,
      push.newNavigationTitle ?? '',
      /* isModal */ false,
      push.hasTransparentBackground,
      push.animated ?? true,
    );
  }

  private doPresent(present: NavigationPresent) {
    // TODO(simon): Real impl
    this.pushComponent(
      present.componentPath!,
      present.viewModel,
      present.context,
      present.newNavigationTitle ?? '',
      /* isModal */ true,
      present.hasTransparentBackground,
      present.animated ?? true,
    );
  }

  private doBack(animated: boolean) {
    this.pop(animated);
  }

  private doDismiss(animated: boolean) {
    // TODO(simon): Real impl
    this.pop(animated);
  }

  private doSetNavigationTitle(title: string) {
    const items = this.state.stack.slice(0, this.state.stack.length - 1);
    const lastItem = this.state.stack[this.state.stack.length - 1];
    this.setState({
      stack: [...items, { ...lastItem, title }],
    });
  }

  private getCurrentItem(): ComponentStackEntry {
    return this.state.stack[this.state.stack.length - 1];
  }

  pushComponent(
    componentPath: string,
    viewModel: any,
    context: any,
    title: string,
    isModal: boolean,
    isTransparent: boolean,
    animated: boolean,
  ) {
    this.taskQueue.enqueueTask(done => {
      const newEntry = this.makeEntry(componentPath, viewModel, context, title, isModal, isTransparent);

      if (animated && this.state.stack.length > 0) {
        const previousEntry = this.getCurrentItem();

        // Render with the item at the right
        this.renderer.batchUpdates(() => {
          this.setState({ stack: [...this.state.stack, newEntry] });

          this.applyTransitionFromState(previousEntry, [newEntry]);
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.animatePromise({ duration: ANIMATION_DURATION }, () => {
          this.applyTransitionToState(previousEntry, [newEntry]);
        }).then(() => {
          this.updateStackNonAnimated(this.state.stack);
          done();
        });
      } else {
        this.updateStackNonAnimated([...this.state.stack, newEntry]);
        done();
      }
    });
  }

  private applyTransitionFromState(leftEntry: ComponentStackEntry, rightEntries: ComponentStackEntry[]) {
    const containerFrame = this.containerRef.single()!.frame;

    for (const rightEntry of rightEntries) {
      rightEntry.viewContainerRef.setAttribute('opacity', 1.0);

      if (rightEntry.isModal) {
        rightEntry.viewContainerRef.setAttribute('translationY', containerFrame.height);
      } else {
        rightEntry.viewContainerRef.setAttribute('translationX', containerFrame.width);
      }
    }

    leftEntry.viewContainerRef.setAttribute('opacity', 1.0);
    leftEntry.viewContainerRef.setAttribute('translationX', 0);
    leftEntry.occlusionViewRef.setAttribute('opacity', 0);
  }

  private applyTransitionToState(leftEntry: ComponentStackEntry, rightEntries: ComponentStackEntry[]) {
    const containerFrame = this.containerRef.single()!.frame;

    let hasModal = false;
    for (const rightEntry of rightEntries) {
      rightEntry.viewContainerRef.setAttribute('opacity', 1.0);

      if (rightEntry.isModal) {
        hasModal = true;
        rightEntry.viewContainerRef.setAttribute('translationY', 0);
      } else {
        rightEntry.viewContainerRef.setAttribute('translationX', 0);
      }
    }

    leftEntry.viewContainerRef.setAttribute('opacity', 1.0);

    if (hasModal) {
      leftEntry.viewContainerRef.setAttribute('translationX', 0);
    } else {
      leftEntry.viewContainerRef.setAttribute('translationX', -containerFrame.width / 6);
    }

    leftEntry.occlusionViewRef.setAttribute('opacity', 1.0);
  }

  private makeEntry(
    componentPath: string,
    viewModel: any,
    context: any,
    title: string,
    isModal: boolean,
    isTransparent: boolean,
  ): ComponentStackEntry {
    const parsedComponentPath = parseComponentPath(componentPath);
    const moduleLoader = getModuleLoader();
    const requireFunc = moduleLoader.load.bind(moduleLoader);
    const ctor = new Lazy(() => resolveComponentConstructor(requireFunc, parsedComponentPath));

    const hotReloadObserver = getModuleLoader().onHotReload(module, parsedComponentPath.filePath, () => {
      this.hotReloadedComponents[componentPath] = true;

      if (!this.scheduledRebuild) {
        this.scheduledRebuild = true;

        onIdleInterruptible(() => {
          if (this.isDestroyed()) {
            return;
          }

          this.scheduledRebuild = false;
          this.rebuildStack();
        });
      }
    });

    const key = (++this.keySequence).toString();

    const navigator = new DesktopAppNavigator(this);
    const contextWithNavigator = { ...context, navigator };

    return {
      key,
      ctor,
      componentPath,
      viewModel,
      title,
      isModal,
      hotReloadObserver,
      context: contextWithNavigator,
      ref: new ComponentRef(),
      viewContainerRef: new ElementRef(),
      occlusionViewRef: new ElementRef(),
      isTransparent,
    };
  }

  popToNavigator(navigator: INavigator, animated: boolean) {
    this.taskQueue.enqueueTask(done => {
      for (let i = 0; i < this.state.stack.length; i++) {
        const entry = this.state.stack[i];
        if (entry.context.navigator === navigator) {
          if (i !== 0) {
            this.doPop(entry, animated, done);
          } else {
            done();
          }

          return;
        }
      }

      done();
    });
  }

  pop(animated: boolean) {
    this.taskQueue.enqueueTask(done => {
      if (this.state.stack.length > 1) {
        const itemToRemove = this.getCurrentItem();
        this.doPop(itemToRemove, animated, done);
      }
    });
  }

  private doPop(atItem: ComponentStackEntry, animated: boolean, done: () => void) {
    const itemsToRemove: ComponentStackEntry[] = [];
    const itemIndex = this.state.stack.indexOf(atItem);
    const newTopItem = this.state.stack[itemIndex - 1];

    for (let i = itemIndex; i < this.state.stack.length; i++) {
      itemsToRemove.push(this.state.stack[i]);
    }

    for (const itemToRemove of itemsToRemove) {
      this.teardownStackEntry(itemToRemove);
    }

    if (animated) {
      this.renderer.batchUpdates(() => {
        this.applyTransitionToState(newTopItem, itemsToRemove);
      });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.animatePromise({ duration: ANIMATION_DURATION }, () => {
        this.applyTransitionFromState(newTopItem, itemsToRemove);
      }).then(() => {
        const index = this.state.stack.indexOf(atItem);
        if (index >= 0) {
          const newStack = this.state.stack.slice(0, itemIndex);
          this.updateStackNonAnimated(newStack);
        }
        done();
      });
    } else {
      this.updateStackNonAnimated(this.state.stack.slice(0, itemIndex));
      done();
    }
  }

  private teardownStackEntry(entry: ComponentStackEntry) {
    entry.hotReloadObserver();
  }

  private rebuildStack() {
    const newStack: ComponentStackEntry[] = [];

    for (const entry of this.state.stack) {
      if (this.hotReloadedComponents[entry.componentPath]) {
        this.teardownStackEntry(entry);
        newStack.push(
          this.makeEntry(
            entry.componentPath,
            entry.viewModel,
            entry.context,
            entry.title,
            entry.isModal,
            entry.isTransparent,
          ),
        );
      } else {
        newStack.push(entry);
      }
    }

    this.hotReloadedComponents = {};

    this.updateStackNonAnimated(newStack);
  }

  private updateStackNonAnimated(newStack: ComponentStackEntry[]) {
    this.renderer.batchUpdates(() => {
      this.setState({ stack: newStack });

      const activeItem = this.getCurrentItem();

      const stack = this.state.stack;
      let index = stack.length;
      let previousIsTransparent = false;
      while (index > 0) {
        index--;

        const item = stack[index];
        if (item === activeItem || previousIsTransparent) {
          item.viewContainerRef.setAttribute('translationX', 0);
          item.viewContainerRef.setAttribute('opacity', 1.0);
          previousIsTransparent = item.isTransparent;
        } else {
          const containerWidth = this.containerRef.single()!.frame.width;
          // Put the container outside of bounds so its not inflated
          item.viewContainerRef.setAttribute('translationX', containerWidth * 10000);
          item.viewContainerRef.setAttribute('opacity', 0.0);
          previousIsTransparent = false;
        }
      }
    });
  }
}

const style = {
  itemContainer: new Style<Layout>({
    width: '100%',
    flexGrow: 1,
  }),
  item: new Style<View>({
    position: 'absolute',
    width: '100%',
    height: '100%',
  }),
  occlusionOverlay: new Style<View>({
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  }),
};

class DesktopAppNavigator implements INavigator, JSOnlyINavigator {
  constructor(private navigationView: NavigationView) {}

  // tslint:disable-next-line: variable-name
  __shouldDisableMakeOpaque = true;

  private hasTransparentBackground(page: INavigatorPageConfig): boolean {
    const componentContext = page.componentContext as NavigationPageContext;
    if (!componentContext) {
      return false;
    }
    return componentContext.pageNavigationOptions?.pageBackgroundColor === 'transparent';
  }

  pushComponent(page: INavigatorPageConfig, animated: boolean): void {
    this.navigationView.pushComponent(
      page.componentPath,
      page.componentViewModel,
      page.componentContext,
      page.platformNavigationTitle ?? '',
      /* isModal */ false,
      this.hasTransparentBackground(page),
      animated,
    );
  }

  pop(animated: boolean): void {
    this.navigationView.popToNavigator(this, animated);
  }

  popToRoot(animated: boolean): void {
    // TODO: Actual implementation. Could pop until the next isModal (without including it)
    throw new Error('popToRoot is not currently implemented in the desktop app navigation');
  }

  popToSelf(animated: boolean): void {
    // TODO: Actual implementation.
    throw new Error('popToSelf is not currently implemented in the desktop app navigation');
  }

  presentComponent(page: INavigatorPageConfig, animated: boolean): void {
    this.navigationView.pushComponent(
      page.componentPath,
      page.componentViewModel,
      page.componentContext,
      page.platformNavigationTitle ?? '',
      /* isModal */ true,
      this.hasTransparentBackground(page),
      animated,
    );
  }

  dismiss(animated: boolean): void {
    this.navigationView.popToNavigator(this, animated);
  }

  forceDisableDismissalGesture(forceDisable: boolean): void {
    console.error('forceDisableDismissalGesture is not implemented in the desktop app navigation');
  }

  setBackButtonObserver(observer: (() => void) | undefined): void {
    // setBackButtonObserver is not implemented in the desktop app navigation
  }

  setOnPausePopAfterDelay(delayMs: number | undefined): void {
    // setOnPausePopAfterDelay is not implemented in the desktop app navigation
  }
}
