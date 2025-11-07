import { resolveComponentConstructor } from 'valdi_core/src/ComponentPath';
import { ValdiRuntime } from 'valdi_core/src/ValdiRuntime';
import { IComponent } from 'valdi_core/src/IComponent';
import { RequireFunc } from 'valdi_core/src/IModuleLoader';
import { protectNativeRefsForContextId } from 'valdi_core/src/NativeReferences';
import { InstrumentedComponentJSX, createComponent } from 'valdi_test/test/JSXTestUtils';
import { INavigator, INavigatorPageConfig, JSOnlyINavigator } from 'navigation/src/INavigator';

declare const require: RequireFunc;
declare const runtime: ValdiRuntime;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getMockNavigator = () => {
  return jasmine.createSpyObj<INavigator & JSOnlyINavigator>(
    'Navigator',
    [
      'pushComponent',
      'pop',
      'popToRoot',
      'popToSelf',
      'presentComponent',
      'dismiss',
      'forceDisableDismissalGesture',
      'setBackButtonObserver',
      'setOnPausePopAfterDelay',
    ],
    { __shouldDisableMakeOpaque: true },
  );
};

interface Page<ViewModel extends object = any, Context extends object = any> {
  // This should be set for all pages except the root page.
  instrumentedComponent?: InstrumentedComponentJSX<IComponent<ViewModel, Context>, ViewModel, Context>;
  component: IComponent<ViewModel, Context>;
}

export type ViewStack = Page[];
type Disposable = () => void;

export interface MockNavigation {
  rootNavigator: INavigator;
  currentStack: ViewStack | undefined;
  currentPage: Page | undefined;
  currentComponent: IComponent;
  setRootPage: (page: IComponent) => void;
  clear: () => void;
}

interface MockNavigationOptions {
  /** Whether to protect native refs in sub pages that presented from the root component */
  protectNativeRefs?: boolean;
}

/**
 * Mocking the navigation stack and navigator.
 * It is useful for integration tests where your component could present another pages.
 * Example usage see `src/valdi/navigation/test/Navigator.spec.tsx`.
 */
export function getMockNavigation({ protectNativeRefs = false }: MockNavigationOptions = {}): MockNavigation {
  const stacks: ViewStack[] = [[]];
  const protectNativeRefsDisposables: Disposable[] = [];

  /**
   * @returns The top stack of pages
   */
  const getCurrentStack = (): ViewStack | undefined => stacks[stacks.length - 1]!;

  /**
   * @returns The current top page
   */
  const getCurrentPage = (): Page | undefined => {
    const currentStack = getCurrentStack();
    if (!currentStack) {
      return undefined;
    }
    return currentStack[currentStack.length - 1]!;
  };

  /**
   * @returns The root page
   */
  const getRootPage = (): Page | undefined => stacks[0]?.[0];

  /**
   * Set the root page of the navigation stack.
   */
  const setRootPage = (page: IComponent): void => {
    if (!stacks.length) {
      stacks.push([]);
    }
    stacks[0]!.push({ component: page });
  };

  /**
   * Create a new page
   */
  const createPage = (pageConfig: INavigatorPageConfig): Page => {
    const componentConstructor = resolveComponentConstructor(require, pageConfig.componentPath);
    const injectedContext = {
      ...((pageConfig.componentContext as object) || {}),
      // create a new navigator for the new page
      navigator: createNavigator(),
    };
    const instrumentedComponent = createComponent(componentConstructor, pageConfig.componentViewModel, injectedContext);
    return {
      instrumentedComponent,
      component: instrumentedComponent.getComponent(),
    };
  };

  /**
   * Destroy a page
   */
  const destroyPage = (page: Page | undefined): void => {
    if (!page) {
      return;
    }
    if (page === getRootPage()) {
      throw new Error('You are trying to destroy the root page, use navigator.clear() and valdiIt instead.');
    }
    if (!page.instrumentedComponent) {
      throw new Error('Expected page to have instrumentedComponent set in destroyPage.');
    }

    // Protect the native refs for the contextId
    if (protectNativeRefs) {
      const contextId = getContextIdForComponent(page.component);
      protectNativeRefsDisposables.push(protectNativeRefsForContextId(contextId));
    }
    // Destroy the page
    page.instrumentedComponent.destroy();

    // We need to restore the global context after destroying any page
    // as the valdi runtime doesn't do it automatically
    runtime.pushCurrentContext(undefined);
  };

  /**
   * Destroy multiple pages
   */
  const destroyPages = (pages: Page[] | undefined): void => {
    // Destroy pages in reverse order
    pages?.reverse().forEach(page => destroyPage(page));
  };

  /**
   * Create a new navigator
   */
  const createNavigator = (): INavigator => {
    const currentStack = getCurrentStack();
    if (!currentStack) {
      throw new Error('Current stack not set');
    }
    // Current page has not been pushed into the stack yet, because we need to create the navigator first.
    // So the index of the current page in the stack is the length of the stack.
    const currentStackPosition = currentStack.length;
    const navigator = getMockNavigator();
    navigator.pushComponent.and.callFake(pageConfig => {
      currentStack.push(createPage(pageConfig));
    });
    navigator.pop.and.callFake(() => {
      const pageToRemove = currentStack.pop();
      destroyPage(pageToRemove);
    });
    navigator.popToRoot.and.callFake(() => {
      const pagesToRemove = currentStack.splice(1);
      destroyPages(pagesToRemove);
    });
    navigator.popToSelf.and.callFake(() => {
      const pagesToRemove = currentStack.splice(currentStackPosition + 1);
      destroyPages(pagesToRemove);
    });
    navigator.presentComponent.and.callFake(pageConfig => {
      // First create a new stack and push to view stacks
      const newStack: ViewStack = [];
      stacks.push(newStack);
      // push the page into the new stack
      newStack.push(createPage(pageConfig));
    });
    navigator.dismiss.and.callFake(() => {
      const stackToRemove = stacks.pop();
      destroyPages(stackToRemove);
    });

    return navigator;
  };

  /**
   * Clear the whole navigation stack
   */
  const clear = (): void => {
    stacks.length = 0;
    protectNativeRefsDisposables.forEach(disposable => disposable());
  };

  return {
    rootNavigator: createNavigator(),
    get currentStack() {
      return getCurrentStack();
    },
    get currentPage() {
      return getCurrentPage();
    },
    get currentComponent() {
      if (!this.currentPage) {
        throw new Error('No root page exists');
      }
      return this.currentPage.component;
    },
    setRootPage,
    clear,
  };
}

const getContextIdForComponent = (component: IComponent): string => component.renderer.contextId;
