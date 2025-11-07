import { ComponentRef } from 'valdi_core/src/ComponentRef';
import { Device } from 'valdi_core/src/Device';
import { IComponent } from 'valdi_core/src/IComponent';
import { IRenderedVirtualNode } from 'valdi_core/src/IRenderedVirtualNode';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { IRenderedComponentHolder } from 'valdi_tsx/src/IRenderedComponentHolder';

interface FocusableComponent extends IComponent {
  setFocused(focused: boolean): void;
}

interface FocusableComponentRefOptions {
  delayBeforeFocusingOnIOS?: boolean;
}

export class FocusableComponentRef<T extends FocusableComponent>
  implements IRenderedComponentHolder<T, IRenderedVirtualNode>
{
  private readonly componentRef = new ComponentRef<T>();

  private focusNextCreated = false;

  constructor(private options?: FocusableComponentRefOptions) {}

  setFocused(focused: boolean): void {
    if (focused) {
      const first = this.componentRef.single();
      if (first) {
        first.setFocused(true);
      } else {
        this.focusNextCreated = true;
      }
    } else {
      for (const elem of this.componentRef.all()) {
        elem.setFocused(false);
      }
      this.focusNextCreated = false;
    }
  }

  onComponentDidCreate(component: T, virtualNode: IRenderedVirtualNode): void {
    if (this.focusNextCreated) {
      this.focusNextCreated = false;
      // On iOS 13, in some cases, we want ensure that the textfield is fully created
      // and ready to be focused so we wait for the next tick to focus it
      if (this.options?.delayBeforeFocusingOnIOS && Device.isIOS()) {
        setTimeoutInterruptible(() => {
          component.setFocused(true);
        });
      } else {
        component.setFocused(true);
      }
    }
    return this.componentRef.onComponentDidCreate(component, virtualNode);
  }
  onComponentWillDestroy(component: T, virtualNode: IRenderedVirtualNode): void {
    return this.componentRef.onComponentWillDestroy(component, virtualNode);
  }
}
